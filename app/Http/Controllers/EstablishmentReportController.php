<?php

namespace App\Http\Controllers;

use App\Models\Establishment;
use App\Models\InspectionResult;
use App\Models\Inspection;
use App\Models\InspectionChecklistResponse;
use App\Models\ChecklistQuestion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class EstablishmentReportController extends Controller
{
    /**
     * Display the establishment reports page.
     */
    public function index()
    {
        return Inertia::render('Admin/EstablishmentReports');
    }

    /**
     * Fetch establishment reports data based on filters.
     */
    public function getData(Request $request)
    {
        $filters = $request->only(['date_from', 'date_to', 'quarter', 'year', 'establishment_id', 'status']);
        
        \Log::info('Establishment Report - Fetching data with filters:', $filters);
        
        // Start with active establishments by default
        $query = Establishment::with(['businessType', 'inspectionResults.inspection']);

        // Apply status filter
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        } else {
            $query->where('status', 'active');
        }

        // Apply establishment filter
        if (!empty($filters['establishment_id'])) {
            $query->where('id', $filters['establishment_id']);
        }

        $establishments = $query->get();

        \Log::info('Establishment Report - Found establishments: ' . $establishments->count());
        
        if ($establishments->count() > 0) {
            \Log::info('Establishment Report - First establishment:', [
                'name' => $establishments->first()->name,
                'business_type' => $establishments->first()->businessType ? $establishments->first()->businessType->name : 'None',
                'inspection_results_count' => $establishments->first()->inspectionResults->count()
            ]);
        }

        // Process each establishment to get inspection data
        $establishmentData = $establishments->map(function ($establishment) use ($filters) {
            // Get inspection results for this establishment
            $inspectionResultsQuery = $establishment->inspectionResults()->with('inspection');
            
            // Apply date filters
            if (!empty($filters['date_from'])) {
                $inspectionResultsQuery->whereHas('inspection', function($q) use ($filters) {
                    $q->whereDate('inspection_timestamp', '>=', $filters['date_from']);
                });
            }
            if (!empty($filters['date_to'])) {
                $inspectionResultsQuery->whereHas('inspection', function($q) use ($filters) {
                    $q->whereDate('inspection_timestamp', '<=', $filters['date_to']);
                });
            }
            if (!empty($filters['quarter'])) {
                $quarterValue = $filters['quarter'];
                if (strpos($quarterValue, 'Q') === 0) {
                    $quarterValue = substr($quarterValue, 1);
                }
                $dbQuarterValue = 'Q' . $quarterValue;
                $inspectionResultsQuery->whereHas('inspection', function($q) use ($dbQuarterValue) {
                    $q->where('quarter', $dbQuarterValue);
                });
            }
            if (!empty($filters['year'])) {
                $inspectionResultsQuery->whereHas('inspection', function($q) use ($filters) {
                    $q->whereYear('inspection_timestamp', $filters['year']);
                });
            }

            $inspectionResults = $inspectionResultsQuery->get();
            
            \Log::info('Processing establishment: ' . $establishment->name . ' - Inspection results: ' . $inspectionResults->count());
            
            // Get checklist responses for these inspections
            $inspectionResultIds = $inspectionResults->pluck('id');
            $checklistResponses = InspectionChecklistResponse::with([
                'checklistQuestion.inspectionCategory'
            ])
            ->whereIn('inspection_result_id', $inspectionResultIds)
            ->get();

            \Log::info('Found checklist responses: ' . $checklistResponses->count() . ' for establishment: ' . $establishment->name);

            // Calculate compliance rate
            $totalResponses = $checklistResponses->count();
            $positiveResponses = 0;
            $negativeResponses = 0;
            $naResponses = 0;

            foreach ($checklistResponses as $response) {
                $responseType = $this->classifyResponse($response->response);
                switch ($responseType) {
                    case 'positive':
                        $positiveResponses++;
                        break;
                    case 'negative':
                        $negativeResponses++;
                        break;
                    case 'na':
                        $naResponses++;
                        break;
                }
            }

            $applicableResponses = $totalResponses - $naResponses;
            $complianceRate = $applicableResponses > 0 ? round(($positiveResponses / $applicableResponses) * 100, 2) : 0;

            // Get last inspection date
            $lastInspectionDate = $inspectionResults->sortByDesc('inspection.inspection_timestamp')->first()?->inspection?->inspection_timestamp;

            // Group responses by category and question for display
            $inspectionResponses = $checklistResponses->map(function ($response) {
                return [
                    'category_name' => $response->checklistQuestion->inspectionCategory->name ?? 'Uncategorized',
                    'question_text' => $response->checklistQuestion->question,
                    'response' => $response->response,
                    'inspection_date' => $response->inspectionResult?->inspection?->inspection_timestamp
                ];
            })->sortBy('category_name')->values();

            return [
                'id' => $establishment->id,
                'name' => $establishment->name,
                'proponent' => $establishment->proponent,
                'address' => $establishment->address,
                'Barangay' => $establishment->Barangay,
                'business_type' => $establishment->businessType->name ?? 'N/A',
                'contact_number' => $establishment->contact_number,
                'email' => $establishment->email,
                'total_capacity' => $establishment->total_capacity,
                'number_of_rooms' => $establishment->number_of_rooms,
                'number_of_employees' => $establishment->number_of_employees,
                'status' => $establishment->status,
                'inspection_count' => $inspectionResults->count(),
                'compliance_rate' => $complianceRate,
                'last_inspection_date' => $lastInspectionDate,
                'inspection_responses' => $inspectionResponses
            ];
        });

        // Calculate summary statistics
        $totalEstablishments = $establishmentData->count();
        $activeEstablishments = $establishmentData->where('status', 'active')->count();
        $totalInspections = $establishmentData->sum('inspection_count');
        $overallComplianceRate = $totalEstablishments > 0 
            ? round($establishmentData->sum('compliance_rate') / $totalEstablishments, 2)
            : 0;

        $summaryData = [
            'total_establishments' => $totalEstablishments,
            'active_establishments' => $activeEstablishments,
            'total_inspections' => $totalInspections,
            'overall_compliance_rate' => $overallComplianceRate
        ];

        \Log::info('Establishment Report - Final summary statistics:', $summaryData);

        return response()->json([
            'establishments' => $establishmentData->values(),
            'summary' => $summaryData
        ]);
    }

    /**
     * Export establishment reports data.
     */
    public function export(Request $request)
    {
        $filters = $request->only(['date_from', 'date_to', 'quarter', 'year', 'establishment_id', 'status']);
        
        // Get the same data as the report
        $data = $this->getData($request);
        $establishments = $data->getData()->establishments;
        
        // Create CSV content
        $csvContent = "\xEF\xBB\xBF"; // UTF-8 BOM
        $csvContent .= "Establishment Name,Proponent,Address,Barangay,Business Type,Contact Number,Email,Total Capacity,Number of Rooms,Number of Employees,Status,Inspection Count,Compliance Rate,Last Inspection Date\n";
        
        foreach ($establishments as $establishment) {
            $csvContent .= '"' . str_replace('"', '""', $establishment->name) . '",';
            $csvContent .= '"' . str_replace('"', '""', $establishment->proponent) . '",';
            $csvContent .= '"' . str_replace('"', '""', $establishment->address) . '",';
            $csvContent .= '"' . str_replace('"', '""', $establishment->Barangay) . '",';
            $csvContent .= '"' . str_replace('"', '""', $establishment->business_type) . '",';
            $csvContent .= '"' . str_replace('"', '""', $establishment->contact_number) . '",';
            $csvContent .= '"' . str_replace('"', '""', $establishment->email) . '",';
            $csvContent .= $establishment->total_capacity . ',';
            $csvContent .= $establishment->number_of_rooms . ',';
            $csvContent .= $establishment->number_of_employees . ',';
            $csvContent .= $establishment->status . ',';
            $csvContent .= $establishment->inspection_count . ',';
            $csvContent .= $establishment->compliance_rate . '%,';
            $csvContent .= '"' . ($establishment->last_inspection_date ? date('Y-m-d', strtotime($establishment->last_inspection_date)) : 'N/A') . '"' . "\n";
        }
        
        $filename = 'establishment_reports_' . date('Y-m-d_H-i-s') . '.csv';
        
        return response($csvContent)
            ->header('Content-Type', 'text/csv; charset=UTF-8')
            ->header('Content-Disposition', "attachment; filename=\"$filename\"");
    }

    /**
     * Classify response as positive, negative, or N/A.
     */
    private function classifyResponse($response)
    {
        if (!$response) return 'na';
        
        $responseStr = strtolower(trim($response));
        
        // Check for N/A responses
        if ($responseStr === 'n/a' || 
            $responseStr === 'na' || 
            $responseStr === 'not applicable' || 
            strpos($responseStr, 'n/a') !== false) {
            return 'na';
        }
        
        // Check for positive responses
        $positiveIndicators = ['yes', 'compliant', 'pass', 'positive', 'ok', 'okay', 'approved', 'satisfactory', 'good', 'excellent', 'complete', 'done', 'true', '1', 'present', 'available', 'installed', 'functional', 'working', 'operational'];
        foreach ($positiveIndicators as $indicator) {
            if (strpos($responseStr, $indicator) !== false) {
                return 'positive';
            }
        }
        
        // Check for negative responses
        $negativeIndicators = ['no', 'non_compliant', 'fail', 'negative', 'not', 'disapproved', 'unsatisfactory', 'poor', 'incomplete', 'pending', 'false', '0', 'violated', 'violation', 'issue', 'problem', 'deficiency', 'non-present', 'absent', 'unavailable', 'not installed', 'non-functional', 'broken', 'malfunctioning'];
        foreach ($negativeIndicators as $indicator) {
            if (strpos($responseStr, $indicator) !== false) {
                return 'negative';
            }
        }
        
        // Default to neutral for unclear responses
        return 'neutral';
    }
}
