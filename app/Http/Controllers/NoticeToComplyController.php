<?php

namespace App\Http\Controllers;

use App\Models\InspectionChecklistResponse;
use App\Models\InspectionResult;
use App\Models\Inspection;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class NoticeToComplyController extends Controller
{
    /**
     * Display the Notice to Comply monitoring page.
     */
    public function index()
    {
        return Inertia::render('Admin/NoticeToComply');
    }

    /**
     * Get establishments that need to comply (3-day deadline tracking).
     */
    public function getData(Request $request)
    {
        try {
            $filters = $request->only(['status', 'date_from', 'date_to', 'establishment_id', 'question_id', 'page', 'per_page']);
            
            // Debug logging
            \Log::info('NoticeToComply getData - Filters: ' . json_encode($filters));
            \Log::info('Current Date: ' . Carbon::now()->toDateString());
            
            // First, let's check if we have any establishments at all
            $totalEstablishments = \App\Models\Establishment::count();
            \Log::info('Total establishments in database: ' . $totalEstablishments);
            
            $query = InspectionChecklistResponse::with([
                'inspectionResult.inspection',
                'inspectionResult.establishment.businessType',
                'checklistQuestion.inspectionCategory',
                'inspectionResult.staff'
            ])
            ->where(function($q) {
                // Include ALL questions that need compliance (not just Environmental Clearance)
                $q->where(function($responseQuery) {
                    // Include negative responses OR expired responses (those with notes) OR recently complied items
                    $responseQuery->whereRaw('LOWER(response) IN (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
                        ['no', 'non_compliant', 'fail', 'negative', 'not', 'disapproved', 'unsatisfactory', 'poor', 'incomplete', 'expired', 'violated', 'violation', 'issue', 'problem', 'deficiency', 'non-present', 'absent', 'unavailable', 'not installed'])
                    ->orWhere(function($subQ) {
                        // Also include any response that has notes (indicating expiration/issue)
                        $subQ->whereNotNull('notes')
                              ->where('notes', '!=', '');
                    })
                    ->orWhere(function($subQ) {
                        // Include recently complied items (within last 7 days) to keep them visible
                        $subQ->whereNotNull('complied_at')
                              ->where('complied_at', '>=', now()->subDays(7));
                    });
                });
            });

            // Debug: Count total responses before filtering
            $totalResponsesBefore = $query->count();
            \Log::info('Total responses before filtering: ' . $totalResponsesBefore);

            // Apply filters
            if (!empty($filters['status'])) {
                if ($filters['status'] === 'pending') {
                    $query->whereNull('complied_at');
                } elseif ($filters['status'] === 'complied') {
                    $query->whereNotNull('complied_at');
                } elseif ($filters['status'] === 'overdue') {
                    // Use inspection timestamp for consistency with display logic
                    \Log::info('Applying overdue filter...');
                    $query->whereHas('inspectionResult.inspection', function($q) {
                        $q->whereRaw('DATE_ADD(inspection_timestamp, INTERVAL 3 DAY) <= NOW()');
                    })
                    ->whereNull('complied_at');
                    \Log::info('Overdue filter applied');
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

            if (!empty($filters['question_id'])) {
                $query->where('checklist_question_id', $filters['question_id']);
            }

            // Debug: Count total responses after filtering
            $totalResponsesAfter = $query->count();
            \Log::info('Total responses after filtering: ' . $totalResponsesAfter);

            $responses = $query->get()->map(function($response) {
                // Use actual inspection timestamp instead of response created_at
                $inspectionDate = $response->inspectionResult->inspection->inspection_timestamp ?? $response->created_at;
                $complianceDeadline = $inspectionDate->copy()->addDays(3);
                
                // Debugging: Log values of current time, deadline, and isOverdue
                \Log::info('Debugging Overdue Logic:');
                \Log::info('  Carbon::now(): ' . Carbon::now()->toDateTimeString());
                \Log::info('  Compliance Deadline: ' . $complianceDeadline->toDateTimeString());
                \Log::info('  Is Overdue (before check): ' . (Carbon::now()->startOfDay()->greaterThanOrEqualTo($complianceDeadline->startOfDay()) ? 'true' : 'false'));
                
                $daysRemaining = Carbon::now()->diffInDays($complianceDeadline, false);
                $isOverdue = Carbon::now()->startOfDay()->greaterThanOrEqualTo($complianceDeadline->startOfDay());
                $hasComplied = !is_null($response->complied_at);
                
                // Debugging: Log the final status for this response
                \Log::info('  Final Status: ' . ($hasComplied ? 'complied' : ($isOverdue ? 'overdue' : 'pending')));
                \Log::info('  Days Remaining: ' . $daysRemaining);
                \Log::info('  Is Overdue: ' . ($isOverdue ? 'true' : 'false'));

                return [
                    'id' => $response->id,
                    'establishment_name' => $response->inspectionResult->establishment->name ?? 'N/A',
                    'establishment_id' => $response->inspectionResult->establishment->id ?? null,
                    'business_type' => $response->inspectionResult->establishment->businessType->name ?? 'N/A',
                    'address' => $response->inspectionResult->establishment->address ?? 'N/A',
                    'owner_name' => $response->inspectionResult->establishment->owner_name ?? 'N/A',
                    'question' => $response->checklistQuestion->question ?? 'N/A',
                    'category' => $response->checklistQuestion->inspectionCategory->name ?? 'N/A',
                    'response' => $response->response,
                    'notes' => $response->notes,
                    'remarks' => $response->remarks,
                    'inspection_date' => $inspectionDate->format('Y-m-d'),
                    'compliance_deadline' => $complianceDeadline->format('Y-m-d'),
                    'days_remaining' => $daysRemaining,
                    'is_overdue' => $isOverdue,
                    'has_complied' => $hasComplied,
                    'complied_at' => $hasComplied ? (is_string($response->complied_at) ? $response->complied_at : $response->complied_at->format('Y-m-d')) : null,
                    'inspector' => $response->inspectionResult->staff 
                        ? ($response->inspectionResult->staff->first_name . ' ' . $response->inspectionResult->staff->last_name)
                        : 'N/A',
                    'inspection_id' => $response->inspectionResult->inspection->id ?? null,
                    'inspection_result_id' => $response->inspection_result_id,
                    'status' => $hasComplied ? 'complied' : ($isOverdue ? 'overdue' : 'pending'),
                    'days_overdue' => $isOverdue && !$hasComplied ? abs($daysRemaining) : 0
                ];
            });

            // Group by establishment for better display
            $groupedByEstablishment = $responses->groupBy('establishment_id')->map(function($establishmentResponses) {
                $firstResponse = $establishmentResponses->first();
                $pendingCount = $establishmentResponses->where('status', 'pending')->count();
                $overdueCount = $establishmentResponses->where('status', 'overdue')->count();
                $compliedCount = $establishmentResponses->where('status', 'complied')->count();
                
                // Debugging: Log the counts for this establishment
                \Log::info('Establishment: ' . $firstResponse['establishment_name']);
                \Log::info('  Pending Count: ' . $pendingCount);
                \Log::info('  Overdue Count: ' . $overdueCount);
                \Log::info('  Complied Count: ' . $compliedCount);
                
                return [
                    'establishment_id' => $firstResponse['establishment_id'],
                    'establishment_name' => $firstResponse['establishment_name'],
                    'business_type' => $firstResponse['business_type'],
                    'address' => $firstResponse['address'],
                    'owner_name' => $firstResponse['owner_name'],
                    'pending_count' => $pendingCount,
                    'overdue_count' => $overdueCount,
                    'complied_count' => $compliedCount,
                    'total_issues' => $establishmentResponses->count(),
                    'most_urgent_deadline' => $establishmentResponses->where('status', 'pending')->min('compliance_deadline'),
                    'issues' => $establishmentResponses->values()
                ];
            })->values();

            // Debug: Log grouped establishments count
            \Log::info('Total grouped establishments: ' . $groupedByEstablishment->count());
            \Log::info('Grouped establishment IDs: ' . $groupedByEstablishment->pluck('establishment_id')->implode(', '));

            // Apply pagination
            $perPage = $request->get('per_page', 10);
            $currentPage = $request->get('page', 1);
            $total = $groupedByEstablishment->count();
            
            $paginatedData = $groupedByEstablishment->forPage($currentPage, $perPage)->values();
            
            $pagination = [
                'current_page' => $currentPage,
                'last_page' => ceil($total / $perPage),
                'per_page' => $perPage,
                'total' => $total,
                'from' => $total > 0 ? (($currentPage - 1) * $perPage) + 1 : null,
                'to' => min($currentPage * $perPage, $total)
            ];

            // Summary statistics
            $summary = [
                'total_establishments' => $groupedByEstablishment->count(),
                'total_pending' => $responses->where('status', 'pending')->count(),
                'total_overdue' => $responses->where('status', 'overdue')->count(),
                'total_complied' => $responses->where('status', 'complied')->count(),
                'critical_overdue' => $groupedByEstablishment->filter(function($est) {
                    return $est['overdue_count'] > 0;
                })->count()
            ];

            return response()->json([
                'establishments' => [
                    'data' => $paginatedData,
                    'pagination' => $pagination
                ],
                'all_responses' => $responses,
                'summary' => $summary
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error in getData: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'error' => 'Server error: ' . $e->getMessage(),
                'establishments' => ['data' => [], 'pagination' => []],
                'all_responses' => [],
                'summary' => []
            ], 500);
        }
    }

    /**
     * Mark a compliance item as complied.
     */
    public function markAsComplied(Request $request, $id)
    {
        try {
            \Log::info('markAsComplied called for ID: ' . $id);
            
            $request->validate([
                'compliance_notes' => 'nullable|string|max:1000'
            ]);

            $response = InspectionChecklistResponse::findOrFail($id);
            \Log::info('Found response:', ['id' => $response->id, 'response' => $response->response]);
            
            $response->complied_at = now();
            $response->compliance_notes = $request->compliance_notes;
            
            $result = $response->save();
            \Log::info('Save result: ' . ($result ? 'success' : 'failed'));

            return response()->json([
                'success' => true,
                'message' => 'Compliance recorded successfully'
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error in markAsComplied: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export notice to comply data to CSV.
     */
    public function export(Request $request)
    {
        $filters = $request->only(['status', 'date_from', 'date_to', 'establishment_id', 'question_id']);
        
        // Reuse the same logic as getData
        $query = InspectionChecklistResponse::with([
            'inspectionResult.inspection',
            'inspectionResult.establishment.businessType',
            'checklistQuestion.inspectionCategory',
            'inspectionResult.staff'
        ])
        ->where(function($q) {
            // Include ALL questions that need compliance (not just Environmental Clearance)
            $q->where(function($responseQuery) {
                // Include negative responses OR expired responses (those with notes)
                $responseQuery->whereRaw('LOWER(response) IN (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
                    ['no', 'non_compliant', 'fail', 'negative', 'not', 'disapproved', 'unsatisfactory', 'poor', 'incomplete', 'expired', 'violated', 'violation', 'issue', 'problem', 'deficiency', 'non-present', 'absent', 'unavailable', 'not installed'])
                ->orWhere(function($subQ) {
                    // Also include any response that has notes (indicating expiration/issue)
                    $subQ->whereNotNull('notes')
                          ->where('notes', '!=', '');
                });
            });
        });

        // Apply same filters as getData
        if (!empty($filters['status'])) {
            if ($filters['status'] === 'pending') {
                $query->whereNull('complied_at');
            } elseif ($filters['status'] === 'complied') {
                $query->whereNotNull('complied_at');
            } elseif ($filters['status'] === 'overdue') {
                // Use inspection timestamp for consistency with display logic
                $query->whereHas('inspectionResult.inspection', function($q) {
                    $q->whereRaw('DATE_ADD(inspection_timestamp, INTERVAL 3 DAY) <= NOW()');
                })
                ->whereNull('complied_at');
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

        if (!empty($filters['question_id'])) {
            $query->where('checklist_question_id', $filters['question_id']);
        }

        $responses = $query->get();

        $filename = "notice_to_comply_report_" . date('Y-m-d') . ".csv";
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function() use ($responses) {
            $file = fopen('php://output', 'w');
            
            // Add BOM for proper UTF-8 encoding in Excel
            fwrite($file, "\xEF\xBB\xBF");

            // Create professional header with formatting hints
            fputcsv($file, ['NOTICE TO COMPLY (YEAR) (MUNICIPAL ORDINANCE 2022-113)']);
            
            // Add formatted header row with proper spacing
            fputcsv($file, [
                'No.',
                'NAME OF ESTABLISHMENT',
                'NAME OF OWNER', 
                'ADDRESS',
                'DATE ISSUED',
                'NEEDED TO COMPLY BASED ON THE ORDINANCE',
                'OTHER NEEDED TO COMPLY',
                'RECEIVED BY:',
                'INSPECTED BY:',
                'REMARKS'
            ]);

            // Add separator line for visual separation
            fputcsv($file, [
                '---',
                '--------------------',
                '--------------------',
                '--------------------',
                '------------',
                '-----------------------------------',
                '-----------------------',
                '------------',
                '------------',
                '--------------------'
            ]);

            // CSV Data with professional formatting
            $rowNumber = 1;
            foreach ($responses as $response) {
                // Use actual inspection timestamp instead of response created_at
                $inspectionDate = $response->inspectionResult->inspection->inspection_timestamp ?? $response->created_at;
                $complianceDeadline = $inspectionDate->copy()->addDays(3);
                $daysRemaining = Carbon::now()->diffInDays($complianceDeadline, false);
                $isOverdue = Carbon::now()->startOfDay()->greaterThanOrEqualTo($complianceDeadline->startOfDay());
                $hasComplied = !is_null($response->complied_at);
                $status = $hasComplied ? 'Complied' : ($isOverdue ? 'Overdue' : 'Pending');

                // Format data properly
                $establishmentName = strtoupper($response->inspectionResult->establishment->name ?? 'N/A');
                $ownerName = strtoupper($response->inspectionResult->establishment->proponent ?? 'N/A');
                $address = ucwords(strtolower($response->inspectionResult->establishment->address ?? 'N/A'));
                $dateIssued = $response->inspectionResult->inspection->inspection_timestamp->format('m/d/Y') ?? $inspectionDate->format('m/d/Y');
                $receivedBy = ucwords(strtolower($response->inspectionResult->receiver_name ?? 'N/A'));
                $inspectedBy = ucwords(strtolower($response->inspectionResult->staff 
                    ? ($response->inspectionResult->staff->first_name . ' ' . $response->inspectionResult->staff->last_name)
                    : 'N/A'));
                $remarks = ucfirst(strtolower($response->notes ?? 'N/A'));

                fputcsv($file, [
                    $rowNumber,
                    $establishmentName,
                    $ownerName,
                    $address,
                    $dateIssued,
                    '', // NEEDED TO COMPLY BASED ON THE ORDINANCE - blank for manual entry
                    '', // OTHER NEEDED TO COMPLY - blank for manual entry
                    $receivedBy,
                    $inspectedBy,
                    $remarks
                ]);
                
                $rowNumber++;
            }

            // Add footer with summary
            fputcsv($file, ['']); // Empty row
            fputcsv($file, ['Summary Report Generated: ' . date('F d, Y h:i A')]);
            fputcsv($file, ['Total Records: ' . ($rowNumber - 1)]);

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export to true XLSX format without corruption
     */
    public function exportExcel(Request $request)
    {
        try {
            $filters = $request->only(['status', 'date_from', 'date_to', 'establishment_id', 'question_id']);
            
            // Get data using same logic as getData
            $query = InspectionChecklistResponse::with([
                'inspectionResult.inspection',
                'inspectionResult.establishment.businessType',
                'checklistQuestion.inspectionCategory',
                'inspectionResult.staff'
            ])
            ->where(function($q) {
                $q->where(function($responseQuery) {
                    // Include negative responses OR expired responses (those with notes) OR recently complied items
                    $responseQuery->whereRaw('LOWER(response) IN (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
                        ['no', 'non_compliant', 'fail', 'negative', 'not', 'disapproved', 'unsatisfactory', 'poor', 'incomplete', 'expired', 'violated', 'violation', 'issue', 'problem', 'deficiency', 'non-present', 'absent', 'unavailable', 'not installed'])
                    ->orWhere(function($subQ) {
                        $subQ->whereNotNull('notes')->where('notes', '!=', '');
                    })
                    ->orWhere(function($subQ) {
                        // Include recently complied items (within last 7 days) to keep them visible
                        $subQ->whereNotNull('complied_at')
                              ->where('complied_at', '>=', now()->subDays(7));
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
                    // Use inspection timestamp for consistency with display logic
                    $query->whereHas('inspectionResult.inspection', function($q) {
                        $q->whereRaw('DATE_ADD(inspection_timestamp, INTERVAL 3 DAY) <= NOW()');
                    })->whereNull('complied_at');
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

            if (!empty($filters['question_id'])) {
                $query->where('checklist_question_id', $filters['question_id']);
            }

            $responses = $query->get();

            // Generate Excel-compatible HTML content
            $content = $this->generateExcelContent($responses);

            $filename = "NOTICE_TO_COMPLY_" . date('Ymd_His') . ".xls";
            
            return response($content)
                ->header('Content-Type', 'application/vnd.ms-excel')
                ->header('Content-Disposition', "attachment; filename=\"$filename\"")
                ->header('Cache-Control', 'max-age=0')
                ->header('Pragma', 'public')
                ->header('Expires', '0');

        } catch (\Exception $e) {
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
            <td colspan="10" align="center" style="background-color: #D9E1F2; font-weight: bold; font-size: 14pt; padding: 8px;">
                NOTICE TO COMPLY (YEAR) (MUNICIPAL ORDINANCE 2022-113)
            </td>
        </tr>';

        // Empty row for spacing
        $html .= '<tr>
            <td colspan="10" style="height: 10px;"></td>
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
            <th align="center" style="width: 150px; border: 1px solid #000;">REMARKS</th>
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
            $html .= "<td style=\"border: 1px solid #000; padding: 4px;\">{$remarks}</td>";
            $html .= "</tr>";

            $rowNumber++;
        }

        // Footer row
        $html .= '<tr>
            <td colspan="10" style="border: 1px solid #000; background-color: #E8E8E8; font-size: 9pt; text-align: center; padding: 4px;">
                Report Generated: ' . date('F d, Y h:i A') . ' | Total Records: ' . ($rowNumber - 1) . '
            </td>
        </tr>';

        $html .= '</table>';

        return $html;
    }

    /**
     * Get establishments for filter dropdown.
     */
    public function getEstablishmentsForFilters()
    {
        $establishments = InspectionChecklistResponse::with('inspectionResult.establishment')
            ->where(function($q) {
                // Include ALL questions that need compliance (not just Environmental Clearance)
                $q->where(function($responseQuery) {
                    // Include negative responses OR expired responses (those with notes)
                    $responseQuery->whereRaw('LOWER(response) IN (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
                        ['no', 'non_compliant', 'fail', 'negative', 'not', 'disapproved', 'unsatisfactory', 'poor', 'incomplete', 'expired', 'violated', 'violation', 'issue', 'problem', 'deficiency', 'non-present', 'absent', 'unavailable', 'not installed'])
                    ->orWhere(function($subQ) {
                        // Also include any response that has notes (indicating expiration/issue)
                        $subQ->whereNotNull('notes')
                              ->where('notes', '!=', '');
                    });
                });
            })
            ->get()
            ->pluck('inspectionResult.establishment')
            ->unique('id')
            ->values()
            ->map(function($establishment) {
                return [
                    'id' => $establishment->id,
                    'name' => $establishment->name
                ];
            });

        return response()->json($establishments);
    }

    /**
     * Get unique questions for filter dropdown.
     */
    public function getQuestionsForFilters()
    {
        $questions = InspectionChecklistResponse::with(['checklistQuestion.inspectionCategory'])
            ->where(function($q) {
                // Include ALL questions that need compliance (not just Environmental Clearance)
                $q->where(function($responseQuery) {
                    // Include negative responses OR expired responses (those with notes)
                    $responseQuery->whereRaw('LOWER(response) IN (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
                        ['no', 'non_compliant', 'fail', 'negative', 'not', 'disapproved', 'unsatisfactory', 'poor', 'incomplete', 'expired', 'violated', 'violation', 'issue', 'problem', 'deficiency', 'non-present', 'absent', 'unavailable', 'not installed'])
                    ->orWhere(function($subQ) {
                        // Also include any response that has notes (indicating expiration/issue)
                        $subQ->whereNotNull('notes')
                              ->where('notes', '!=', '');
                    });
                });
            })
            ->get()
            ->map(function($response) {
                return [
                    'id' => $response->checklistQuestion->id,
                    'question' => $response->checklistQuestion->question,
                    'category' => $response->checklistQuestion->inspectionCategory->name ?? 'Uncategorized'
                ];
            })
            ->unique('id')
            ->values()
            ->sortBy('question')
            ->values();

        return response()->json($questions);
    }
}
