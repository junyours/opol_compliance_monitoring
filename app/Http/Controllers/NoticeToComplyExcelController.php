<?php

namespace App\Http\Controllers;

use App\Models\InspectionChecklistResponse;
use Carbon\Carbon;
use Illuminate\Http\Request;

class NoticeToComplyExcelController extends Controller
{
    /**
     * Export to Excel-compatible format with proper layout
     */
    public function export(Request $request)
    {
        try {
            $filters = $request->only(['status', 'date_from', 'date_to', 'establishment_id']);
            
            // Get data using same logic as main controller
            $query = InspectionChecklistResponse::with([
                'inspectionResult.inspection',
                'inspectionResult.establishment.businessType',
                'checklistQuestion.inspectionCategory',
                'inspectionResult.staff'
            ])
            ->where(function($q) {
                $q->whereHas('checklistQuestion', function($questionQuery) {
                    $questionQuery->whereRaw('LOWER(question) LIKE ?', '%environmental clearance%');
                })
                ->where(function($responseQuery) {
                    $responseQuery->whereRaw('LOWER(response) IN (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
                        ['no', 'non_compliant', 'fail', 'negative', 'not', 'disapproved', 'unsatisfactory', 'poor', 'incomplete', 'expired', 'violated', 'violation', 'issue', 'problem', 'deficiency', 'non-present', 'absent', 'unavailable', 'not installed'])
                    ->orWhere(function($subQ) {
                        $subQ->whereNotNull('notes')->where('notes', '!=', '');
                    });
                });
            });

            // Apply filters
            if (!empty($filters['status'])) {
                if ($filters['status'] === 'pending') {
                    $query->whereNull('complied_at');
                } elseif ($filters['status'] === 'complied') {
                    $query->whereNotNull('complied_at');
                } elseif ($filters['status'] === 'overdue') {
                    $query->whereRaw('DATE_ADD(created_at, INTERVAL 3 DAY) < CURDATE()')->whereNull('complied_at');
                }
            }

            if (!empty($filters['date_from'])) {
                $query->whereDate('created_at', '>=', $filters['date_from']);
            }

            if (!empty($filters['date_to'])) {
                $query->whereDate('created_at', '<=', $filters['date_to']);
            }

            if (!empty($filters['establishment_id'])) {
                $query->whereHas('inspectionResult', function($q) use ($filters) {
                    $q->where('establishment_id', $filters['establishment_id']);
                });
            }

            $responses = $query->get();

            // Generate Excel-compatible content
            $content = $this->generateExcelContent($responses);

            $filename = "NOTICE_TO_COMPLY_" . date('Ymd_His') . ".xls";
            
            return response($content)
                ->header('Content-Type', 'application/vnd.ms-excel')
                ->header('Content-Disposition', "attachment; filename=\"$filename\"")
                ->header('Cache-Control', 'max-age=0');

        } catch (\Exception $e) {
            // Log the error and return a simple error message
            \Log::error('Excel export error: ' . $e->getMessage());
            return response()->json(['error' => 'Export failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Generate Excel-compatible content with proper HTML table formatting
     */
    private function generateExcelContent($responses)
    {
        $html = '<table border="1" cellpadding="4" cellspacing="0" style="border-collapse: collapse; width: 100%;">';

        // Main header - merged across all columns
        $html .= '<tr>
            <td colspan="9" align="center" style="background-color: #D9E1F2; font-weight: bold; font-size: 14pt; padding: 8px;">
                NOTICE TO COMPLY 2025 (MUNICIPAL ORDINANCE 2022-113)
            </td>
        </tr>';

        // Empty row for spacing
        $html .= '<tr>
            <td colspan="9" style="height: 10px;"></td>
        </tr>';

        // Column headers with proper styling
        $html .= '<tr style="background-color: #F2F2F2; font-weight: bold;">
            <th align="center" style="width: 40px; border: 1px solid #000;">No.</th>
            <th align="center" style="width: 200px; border: 1px solid #000;">NAME OF ESTABLISHMENT</th>
            <th align="center" style="width: 150px; border: 1px solid #000;">NAME OF OWNER</th>
            <th align="center" style="width: 250px; border: 1px solid #000;">ADDRESS</th>
            <th align="center" style="width: 100px; border: 1px solid #000;">DATE ISSUED</th>
            <th align="center" style="width: 180px; border: 1px solid #000;">NEEDED TO COMPLY<br>BASED ON THE ORDINANCE</th>
            <th align="center" style="width: 150px; border: 1px solid #000;">OTHER NEEDED TO COMPLY</th>
            <th align="center" style="width: 120px; border: 1px solid #000;">RECEIVED BY:</th>
            <th align="center" style="width: 120px; border: 1px solid #000;">INSPECTED BY:</th>
        </tr>';

        // Data rows
        $rowNumber = 1;
        foreach ($responses as $response) {
            $establishmentName = strtoupper($response->inspectionResult->establishment->name ?? 'N/A');
            $ownerName = strtoupper($response->inspectionResult->establishment->proponent ?? 'N/A');
            $address = ucwords(strtolower($response->inspectionResult->establishment->address ?? 'N/A'));
            $dateIssued = $response->inspectionResult->inspection->inspection_timestamp->format('m/d/Y') ?? Carbon::parse($response->created_at)->format('m/d/Y');
            $receivedBy = ucwords(strtolower($response->inspectionResult->receiver_name ?? 'N/A'));
            $inspectedBy = ucwords(strtolower($response->inspectionResult->staff 
                ? ($response->inspectionResult->staff->first_name . ' ' . $response->inspectionResult->staff->last_name)
                : 'N/A'));
            $remarks = ucfirst(strtolower($response->notes ?? 'N/A'));

            // Alternate row colors
            $bgColor = ($rowNumber % 2 == 0) ? '#FFFFFF' : '#F9F9F9';

            $html .= "<tr style=\"background-color: $bgColor;\">";
            $html .= "<td align=\"center\" style=\"border: 1px solid #000; font-weight: bold;\">{$rowNumber}</td>";
            $html .= "<td style=\"border: 1px solid #000; padding: 4px;\">{$establishmentName}</td>";
            $html .= "<td style=\"border: 1px solid #000; padding: 4px;\">{$ownerName}</td>";
            $html .= "<td style=\"border: 1px solid #000; padding: 4px;\">{$address}</td>";
            $html .= "<td align=\"center\" style=\"border: 1px solid #000; padding: 4px;\">{$dateIssued}</td>";
            $html .= "<td style=\"border: 1px solid #000; padding: 4px; background-color: #FFFF99;\"></td>"; // Yellow highlight for manual entry
            $html .= "<td style=\"border: 1px solid #000; padding: 4px; background-color: #FFFF99;\"></td>"; // Yellow highlight for manual entry
            $html .= "<td style=\"border: 1px solid #000; padding: 4px;\">{$receivedBy}</td>";
            $html .= "<td style=\"border: 1px solid #000; padding: 4px;\">{$inspectedBy}</td>";
            $html .= "</tr>";

            $rowNumber++;
        }

        // Footer row
        $html .= '<tr>
            <td colspan="9" style="border: 1px solid #000; background-color: #E8E8E8; font-size: 9pt; text-align: center; padding: 4px;">
                Report Generated: ' . date('F d, Y h:i A') . ' | Total Records: ' . ($rowNumber - 1) . '
            </td>
        </tr>';

        $html .= '</table>';

        return $html;
    }
}
