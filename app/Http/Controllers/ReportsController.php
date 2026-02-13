<?php

namespace App\Http\Controllers;

use App\Models\InspectionResult;
use App\Models\Establishment;
use App\Models\Inspection;
use App\Models\InspectionChecklistResponse;
use App\Models\ChecklistQuestion;
use App\Models\ConditionalFieldResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ReportsController extends Controller
{
    /**
     * Display the reports page.
     */
    public function index()
    {
        return Inertia::render('Admin/Reports');
    }

    /**
     * Display the checklist responses report page.
     */
    public function checklistResponses()
    {
        return Inertia::render('Admin/ChecklistResponseReports');
    }

    /**
     * Fetch reports data based on filters.
     */
    public function getData(Request $request)
    {
        $filters = $request->only(['date_from', 'date_to', 'quarter', 'year', 'report_type']);
        
        $reports = [];

        // Generate inspection reports
        if ($filters['report_type'] === 'all' || $filters['report_type'] === 'inspection') {
            $reports = array_merge($reports, $this->generateInspectionReports($filters));
        }

        // Generate monitoring reports
        if ($filters['report_type'] === 'all' || $filters['report_type'] === 'monitoring') {
            $reports = array_merge($reports, $this->generateMonitoringReports($filters));
        }

        // Generate establishment reports
        if ($filters['report_type'] === 'all' || $filters['report_type'] === 'establishment') {
            $reports = array_merge($reports, $this->generateEstablishmentReports($filters));
        }

        // Generate government reports
        if ($filters['report_type'] === 'all' || $filters['report_type'] === 'government') {
            $reports = array_merge($reports, $this->generateGovernmentReports($filters));
        }

        // Generate professional reports
        if ($filters['report_type'] === 'all' || $filters['report_type'] === 'professional') {
            $reports = array_merge($reports, $this->generateProfessionalReports($filters));
        }

        return response()->json(['reports' => $reports]);
    }

    /**
     * Fetch checklist responses data based on filters.
     */
    public function getChecklistResponseData(Request $request)
    {
        $filters = $request->only(['date_from', 'date_to', 'quarter', 'year', 'establishment_id', 'category_id', 'question_id']);
        
        $query = InspectionChecklistResponse::with([
            'inspectionResult.inspection', 
            'inspectionResult.establishment.businessType',
            'checklistQuestion.inspectionCategory'
        ]);

        // Apply date filters through inspection result
        if (!empty($filters['date_from'])) {
            $query->whereHas('inspectionResult.inspection', function($q) use ($filters) {
                $q->whereDate('inspection_timestamp', '>=', $filters['date_from']);
            });
        }
        if (!empty($filters['date_to'])) {
            $query->whereHas('inspectionResult.inspection', function($q) use ($filters) {
                $q->whereDate('inspection_timestamp', '<=', $filters['date_to']);
            });
        }
        if (!empty($filters['quarter'])) {
            $query->whereHas('inspectionResult.inspection', function($q) use ($filters) {
                $q->where('quarter', $filters['quarter']);
            });
        }
        if (!empty($filters['year'])) {
            $query->whereHas('inspectionResult.inspection', function($q) use ($filters) {
                $q->whereYear('inspection_timestamp', $filters['year']);
            });
        }
        if (!empty($filters['establishment_id'])) {
            $query->whereHas('inspectionResult', function($q) use ($filters) {
                $q->where('establishment_id', $filters['establishment_id']);
            });
        }
        if (!empty($filters['category_id'])) {
            $query->whereHas('checklistQuestion', function($q) use ($filters) {
                $q->where('category_id', $filters['category_id']);
            });
        }
        if (!empty($filters['question_id'])) {
            $query->where('checklist_question_id', $filters['question_id']);
        }

        $responses = $query->get();
        
        // Debug: Log sample responses to understand the data structure
        \Log::info('Sample responses from database:');
        foreach ($responses->take(5) as $response) {
            \Log::info('Response: ' . $response->response . ' | Type: ' . gettype($response->response) . ' | Question: ' . ($response->checklistQuestion->question ?? 'N/A'));
        }
        
        // Generate analytics data
        $analytics = $this->generateChecklistResponseAnalytics($responses, $filters);
        
        // Debug: Log classification results
        \Log::info('Summary stats:', $this->generateChecklistResponseSummary($responses));
        
        return response()->json([
            'responses' => $responses->toArray(),
            'analytics' => $analytics,
            'summary' => $this->generateChecklistResponseSummary($responses)
        ]);
    }

    /**
     * Generate analytics for checklist responses.
     */
    private function generateChecklistResponseAnalytics($responses, $filters)
    {
        // Response distribution by category
        $categoryAnalysis = [];
        foreach ($responses as $response) {
            $category = $response->checklistQuestion->inspectionCategory;
            $categoryName = $category ? $category->name : 'Uncategorized';
            
            if (!isset($categoryAnalysis[$categoryName])) {
                $categoryAnalysis[$categoryName] = [
                    'category' => $categoryName,
                    'total_responses' => 0,
                    'positive_responses' => 0,
                    'negative_responses' => 0,
                    'na_responses' => 0,
                    'compliance_rate' => 0
                ];
            }
            
            $categoryAnalysis[$categoryName]['total_responses']++;
            
            $responseType = $this->classifyResponse($response->response);
            
            switch ($responseType) {
                case 'na':
                    $categoryAnalysis[$categoryName]['na_responses']++;
                    break;
                case 'positive':
                    $categoryAnalysis[$categoryName]['positive_responses']++;
                    break;
                case 'negative':
                    $categoryAnalysis[$categoryName]['negative_responses']++;
                    break;
                default:
                    // Handle neutral responses - count as neither positive nor negative for compliance calculation
                    break;
            }
        }
        
        // Calculate compliance rates
        foreach ($categoryAnalysis as &$category) {
            $applicableResponses = $category['total_responses'] - $category['na_responses'];
            if ($applicableResponses > 0) {
                $category['compliance_rate'] = round(($category['positive_responses'] / $applicableResponses) * 100, 2);
            }
        }
        
        // Question-level analysis
        $questionAnalysis = [];
        foreach ($responses as $response) {
            $questionId = $response->checklist_question_id;
            $questionText = $response->checklistQuestion->question;
            
            if (!isset($questionAnalysis[$questionId])) {
                $questionAnalysis[$questionId] = [
                    'question_id' => $questionId,
                    'question_text' => $questionText,
                    'category' => $response->checklistQuestion->inspectionCategory->name ?? 'Uncategorized',
                    'total_responses' => 0,
                    'positive_responses' => 0,
                    'negative_responses' => 0,
                    'na_responses' => 0,
                    'compliance_rate' => 0,
                    'establishments_with_issues' => []
                ];
            }
            
            $questionAnalysis[$questionId]['total_responses']++;
            
            $responseType = $this->classifyResponse($response->response);
            
            switch ($responseType) {
                case 'na':
                    $questionAnalysis[$questionId]['na_responses']++;
                    break;
                case 'positive':
                    $questionAnalysis[$questionId]['positive_responses']++;
                    break;
                case 'negative':
                    $questionAnalysis[$questionId]['negative_responses']++;
                    
                    // Track establishments with issues
                    $establishmentName = $response->inspectionResult->establishment->name;
                    if (!in_array($establishmentName, $questionAnalysis[$questionId]['establishments_with_issues'])) {
                        $questionAnalysis[$questionId]['establishments_with_issues'][] = $establishmentName;
                    }
                    break;
                default:
                    // Handle neutral responses
                    break;
            }
        }
        
        // Calculate compliance rates for questions
        foreach ($questionAnalysis as &$question) {
            $applicableResponses = $question['total_responses'] - $question['na_responses'];
            if ($applicableResponses > 0) {
                $question['compliance_rate'] = round(($question['positive_responses'] / $applicableResponses) * 100, 2);
            }
        }
        
        // Sort questions by compliance rate (lowest first)
        usort($questionAnalysis, function($a, $b) {
            return $a['compliance_rate'] <=> $b['compliance_rate'];
        });
        
        return [
            'category_analysis' => array_values($categoryAnalysis),
            'question_analysis' => array_values($questionAnalysis),
            'total_responses' => $responses->count(),
            'response_trends' => $this->generateResponseTrends($responses)
        ];
    }

    /**
     * Generate summary statistics for checklist responses.
     */
    private function generateChecklistResponseSummary($responses)
    {
        $totalResponses = $responses->count();
        $positiveResponses = 0;
        $negativeResponses = 0;
        $naResponses = 0;
        
        \Log::info('=== Starting Summary Classification ===');
        \Log::info('Total responses to process: ' . $totalResponses);
        
        foreach ($responses as $index => $response) {
            $responseType = $this->classifyResponse($response->response);
            
            \Log::info('Response #' . ($index + 1) . ': "' . $response->response . '" -> ' . $responseType);
            
            switch ($responseType) {
                case 'na':
                    $naResponses++;
                    break;
                case 'positive':
                    $positiveResponses++;
                    break;
                case 'negative':
                    $negativeResponses++;
                    break;
                default:
                    // Handle neutral responses
                    \Log::info('NEUTRAL response counted: ' . $response->response);
                    break;
            }
        }
        
        \Log::info('=== Summary Classification Results ===');
        \Log::info('Positive: ' . $positiveResponses);
        \Log::info('Negative: ' . $negativeResponses);
        \Log::info('N/A: ' . $naResponses);
        
        $applicableResponses = $totalResponses - $naResponses;
        $overallComplianceRate = $applicableResponses > 0 ? round(($positiveResponses / $applicableResponses) * 100, 2) : 0;
        
        return [
            'total_responses' => $totalResponses,
            'positive_responses' => $positiveResponses,
            'negative_responses' => $negativeResponses,
            'na_responses' => $naResponses,
            'applicable_responses' => $applicableResponses,
            'overall_compliance_rate' => $overallComplianceRate,
            'unique_establishments' => $responses->pluck('inspectionResult.establishment_id')->unique()->count(),
            'unique_questions' => $responses->pluck('checklist_question_id')->unique()->count()
        ];
    }

    /**
     * Generate response trends over time.
     */
    private function generateResponseTrends($responses)
    {
        $trends = $responses->groupBy(function($response) {
            return $response->inspectionResult->inspection->inspection_timestamp->format('Y-m');
        })->map(function($monthResponses) {
            $positive = 0;
            $negative = 0;
            $total = $monthResponses->count();
            
            foreach ($monthResponses as $response) {
                $responseType = $this->classifyResponse($response->response);
                
                if ($responseType !== 'na') {
                    if ($responseType === 'positive') {
                        $positive++;
                    } elseif ($responseType === 'negative') {
                        $negative++;
                    }
                }
            }
            
            return [
                'month' => $monthResponses->first()->inspectionResult->inspection->inspection_timestamp->format('M Y'),
                'total' => $total,
                'positive' => $positive,
                'negative' => $negative,
                'compliance_rate' => ($positive + $negative) > 0 ? round(($positive / ($positive + $negative)) * 100, 2) : 0
            ];
        })->sortKeys();
        
        return $trends->values()->toArray();
    }

    /**
     * Export checklist responses to CSV.
     */
    public function exportChecklistResponses(Request $request)
    {
        $filters = $request->only(['date_from', 'date_to', 'quarter', 'year', 'establishment_id', 'category_id', 'question_id']);
        
        $query = InspectionChecklistResponse::with([
            'inspectionResult.inspection', 
            'inspectionResult.establishment.businessType',
            'checklistQuestion.inspectionCategory'
        ]);

        // Apply same filters as getChecklistResponseData
        if (!empty($filters['date_from'])) {
            $query->whereHas('inspectionResult.inspection', function($q) use ($filters) {
                $q->whereDate('inspection_timestamp', '>=', $filters['date_from']);
            });
        }
        if (!empty($filters['date_to'])) {
            $query->whereHas('inspectionResult.inspection', function($q) use ($filters) {
                $q->whereDate('inspection_timestamp', '<=', $filters['date_to']);
            });
        }
        if (!empty($filters['quarter'])) {
            $query->whereHas('inspectionResult.inspection', function($q) use ($filters) {
                $q->where('quarter', $filters['quarter']);
            });
        }
        if (!empty($filters['year'])) {
            $query->whereHas('inspectionResult.inspection', function($q) use ($filters) {
                $q->whereYear('inspection_timestamp', $filters['year']);
            });
        }
        if (!empty($filters['establishment_id'])) {
            $query->whereHas('inspectionResult', function($q) use ($filters) {
                $q->where('establishment_id', $filters['establishment_id']);
            });
        }
        if (!empty($filters['category_id'])) {
            $query->whereHas('checklistQuestion', function($q) use ($filters) {
                $q->where('category_id', $filters['category_id']);
            });
        }
        if (!empty($filters['question_id'])) {
            $query->where('checklist_question_id', $filters['question_id']);
        }

        $responses = $query->get();

        $filename = "checklist_response_reports_" . date('Y-m-d') . ".csv";
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function() use ($responses) {
            $file = fopen('php://output', 'w');
            
            // CSV Header
            fputcsv($file, [
                'Establishment Name',
                'Business Type',
                'Inspection Date',
                'Category',
                'Question',
                'Response',
                'Notes',
                'Remarks',
                'Inspector'
            ]);

            // CSV Data
            foreach ($responses as $response) {
                fputcsv($file, [
                    $response->inspectionResult->establishment->name ?? 'N/A',
                    $response->inspectionResult->establishment->businessType->name ?? 'N/A',
                    $response->inspectionResult->inspection->inspection_timestamp ?? 'N/A',
                    $response->checklistQuestion->inspectionCategory->name ?? 'N/A',
                    $response->checklistQuestion->question ?? 'N/A',
                    $response->display_response ?? 'N/A',
                    $response->notes ?? 'N/A',
                    $response->remarks ?? 'N/A',
                    $response->inspectionResult->staff ? ($response->inspectionResult->staff->first_name . ' ' . $response->inspectionResult->staff->last_name) : 'N/A'
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Check if establishment is expired
     */
    private function isEstablishmentExpired($establishment)
    {
        // Check if establishment has expiry_date field
        if (!$establishment || !isset($establishment->expiry_date)) {
            return false;
        }
        
        $expiryDate = $establishment->expiry_date;
        if (!$expiryDate) {
            return false;
        }
        
        return now()->greaterThan($expiryDate);
    }


    /**
     * Display the comprehensive data reports page.
     */
    public function comprehensiveDataPage()
    {
        return Inertia::render('Admin/ComprehensiveDataReports');
    }

    /**
     * Get comprehensive data reports from both InspectionChecklistResponse and ConditionalFieldResponse
     */
    public function getComprehensiveDataReports(Request $request)
    {
        $filters = $request->only(['date_from', 'date_to', 'quarter', 'year', 'establishment_id', 'category_id', 'question_id']);
        
        // Debug: Log received filters
        \Log::info('=== Comprehensive Data Reports Debug ===');
        \Log::info('Received filters:', $filters);
        
        // Get expired InspectionChecklistResponse records
        $expiredChecklistResponses = InspectionChecklistResponse::with([
            'inspectionResult.inspection', 
            'inspectionResult.establishment.businessType',
            'inspectionResult.staff',
            'checklistQuestion.inspectionCategory'
        ])
        ->whereNotNull('notes')
        ->where('notes', '!=', '');

        // Apply filters for checklist responses
        if (!empty($filters['date_from'])) {
            \Log::info('Applying date_from filter: ' . $filters['date_from']);
            $expiredChecklistResponses->whereHas('inspectionResult.inspection', function($q) use ($filters) {
                $q->whereDate('inspection_timestamp', '>=', $filters['date_from']);
            });
        }
        if (!empty($filters['date_to'])) {
            \Log::info('Applying date_to filter: ' . $filters['date_to']);
            $expiredChecklistResponses->whereHas('inspectionResult.inspection', function($q) use ($filters) {
                $q->whereDate('inspection_timestamp', '<=', $filters['date_to']);
            });
        }
        if (!empty($filters['quarter'])) {
            $expiredChecklistResponses->whereHas('inspectionResult.inspection', function($q) use ($filters) {
                $q->where('quarter', $filters['quarter']);
            });
        }
        if (!empty($filters['year'])) {
            $expiredChecklistResponses->whereHas('inspectionResult.inspection', function($q) use ($filters) {
                $q->whereYear('inspection_timestamp', $filters['year']);
            });
        }
        if (!empty($filters['establishment_id'])) {
            $expiredChecklistResponses->whereHas('inspectionResult', function($q) use ($filters) {
                $q->where('establishment_id', $filters['establishment_id']);
            });
        }
        if (!empty($filters['category_id'])) {
            $expiredChecklistResponses->whereHas('checklistQuestion', function($q) use ($filters) {
                $q->where('category_id', $filters['category_id']);
            });
        }
        if (!empty($filters['question_id'])) {
            $expiredChecklistResponses->where('checklist_question_id', $filters['question_id']);
        }

        $expiredChecklistResponses = $expiredChecklistResponses->get();
        
        // Debug: Log query results
        \Log::info('Expired checklist responses found: ' . $expiredChecklistResponses->count());
        foreach ($expiredChecklistResponses as $response) {
            $inspectionDate = $response->inspectionResult->inspection->inspection_timestamp;
            $establishmentName = $response->inspectionResult->establishment->name ?? 'Unknown';
            \Log::info("Found - Date: {$inspectionDate}, Establishment: {$establishmentName}");
        }

        // Get ConditionalFieldResponse records related to expired checklist responses
        $expiredInspectionResultIds = $expiredChecklistResponses->pluck('inspection_result_id')->unique();
        $expiredQuestionIds = $expiredChecklistResponses->pluck('checklist_question_id')->unique();

        $conditionalFieldResponses = ConditionalFieldResponse::with([
            'inspectionResult.inspection', 
            'inspectionResult.establishment.businessType',
            'checklistQuestion.inspectionCategory'
        ])
        ->whereIn('inspection_result_id', $expiredInspectionResultIds)
        ->whereIn('checklist_question_id', $expiredQuestionIds);

        // Apply additional filters for conditional field responses
        if (!empty($filters['date_from'])) {
            $conditionalFieldResponses->whereHas('inspectionResult.inspection', function($q) use ($filters) {
                $q->whereDate('inspection_timestamp', '>=', $filters['date_from']);
            });
        }
        if (!empty($filters['date_to'])) {
            $conditionalFieldResponses->whereHas('inspectionResult.inspection', function($q) use ($filters) {
                $q->whereDate('inspection_timestamp', '<=', $filters['date_to']);
            });
        }
        if (!empty($filters['quarter'])) {
            $conditionalFieldResponses->whereHas('inspectionResult.inspection', function($q) use ($filters) {
                $q->where('quarter', $filters['quarter']);
            });
        }
        if (!empty($filters['year'])) {
            $conditionalFieldResponses->whereHas('inspectionResult.inspection', function($q) use ($filters) {
                $q->whereYear('inspection_timestamp', $filters['year']);
            });
        }
        if (!empty($filters['establishment_id'])) {
            $conditionalFieldResponses->whereHas('inspectionResult', function($q) use ($filters) {
                $q->where('establishment_id', $filters['establishment_id']);
            });
        }
        if (!empty($filters['category_id'])) {
            $conditionalFieldResponses->whereHas('checklistQuestion', function($q) use ($filters) {
                $q->where('category_id', $filters['category_id']);
            });
        }
        if (!empty($filters['question_id'])) {
            $conditionalFieldResponses->where('checklist_question_id', $filters['question_id']);
        }

        $conditionalFieldResponses = $conditionalFieldResponses->get();

        // Generate comprehensive analytics
        $comprehensiveAnalytics = $this->generateComprehensiveAnalytics($expiredChecklistResponses, $conditionalFieldResponses);

        return response()->json([
            'expired_checklist_responses' => $expiredChecklistResponses->toArray(),
            'conditional_field_responses' => $conditionalFieldResponses->toArray(),
            'analytics' => $comprehensiveAnalytics,
            'summary' => [
                'total_expired_checklist_responses' => $expiredChecklistResponses->count(),
                'total_conditional_field_responses' => $conditionalFieldResponses->count(),
                'unique_establishments' => $expiredChecklistResponses->pluck('inspectionResult.establishment_id')->unique()->count(),
                'unique_questions' => $expiredChecklistResponses->pluck('checklist_question_id')->unique()->count()
            ]
        ]);
    }

    /**
     * Generate comprehensive analytics for both models
     */
    private function generateComprehensiveAnalytics($expiredChecklistResponses, $conditionalFieldResponses)
    {
        // Establishment analysis
        $establishmentAnalysis = [];
        foreach ($expiredChecklistResponses as $response) {
            $establishmentId = $response->inspectionResult->establishment_id;
            $establishmentName = $response->inspectionResult->establishment->name ?? 'Unknown';
            $businessType = $response->inspectionResult->establishment->businessType->name ?? 'Unknown';
            
            if (!isset($establishmentAnalysis[$establishmentId])) {
                $establishmentAnalysis[$establishmentId] = [
                    'establishment_name' => $establishmentName,
                    'business_type' => $businessType,
                    'expired_responses_count' => 0,
                    'conditional_fields_count' => 0,
                    'expired_conditional_questions' => [],
                    'questions_with_notes' => [],
                    'conditional_fields' => []
                ];
            }
            
            $establishmentAnalysis[$establishmentId]['expired_responses_count']++;
            $establishmentAnalysis[$establishmentId]['questions_with_notes'][] = [
                'question_id' => $response->checklist_question_id,
                'question_text' => $response->checklistQuestion->question ?? 'Unknown',
                'response' => $response->response,
                'notes' => $response->notes,
                'remarks' => $response->remarks,
                'inspection_date' => $response->inspectionResult->inspection->inspection_timestamp ?? 'Unknown',
                'quarter' => $response->inspectionResult->inspection->quarter ?? 'N/A',
                'inspector' => $response->inspectionResult->staff 
                    ? ($response->inspectionResult->staff->first_name . ' ' . $response->inspectionResult->staff->last_name)
                    : 'N/A',
                'inspection_id' => $response->inspectionResult->inspection->id ?? 'Unknown',
                'inspection_result_id' => $response->inspection_result_id
            ];
        }

        // Count conditional fields per establishment and identify expired conditional questions
        foreach ($conditionalFieldResponses as $fieldResponse) {
            $establishmentId = $fieldResponse->inspectionResult->establishment_id;
            if (isset($establishmentAnalysis[$establishmentId])) {
                $establishmentAnalysis[$establishmentId]['conditional_fields_count']++;
                
                // Check if this conditional field is related to an expired checklist response
                $isExpiredConditional = false;
                foreach ($establishmentAnalysis[$establishmentId]['questions_with_notes'] as $expiredQuestion) {
                    if ($expiredQuestion['question_id'] == $fieldResponse->checklist_question_id) {
                        $isExpiredConditional = true;
                        break;
                    }
                }
                
                $conditionalFieldData = [
                    'field_name' => $fieldResponse->field_name,
                    'field_value' => $fieldResponse->field_value,
                    'question_text' => $fieldResponse->checklistQuestion->question ?? 'Unknown',
                    'question_id' => $fieldResponse->checklist_question_id,
                    'category' => $fieldResponse->checklistQuestion->inspectionCategory->name ?? 'Uncategorized',
                    'is_expired' => $isExpiredConditional,
                    'inspection_date' => $fieldResponse->inspectionResult->inspection->inspection_timestamp ?? 'Unknown',
                    'inspection_result_id' => $fieldResponse->inspection_result_id,
                    'inspection_id' => $fieldResponse->inspectionResult->inspection->id ?? 'Unknown'
                ];
                
                $establishmentAnalysis[$establishmentId]['conditional_fields'][] = $conditionalFieldData;
                
                // Add to expired conditional questions list
                if ($isExpiredConditional) {
                    $establishmentAnalysis[$establishmentId]['expired_conditional_questions'][] = $conditionalFieldData;
                }
            }
        }

        // Question analysis
        $questionAnalysis = [];
        foreach ($expiredChecklistResponses as $response) {
            $questionId = $response->checklist_question_id;
            $questionText = $response->checklistQuestion->question ?? 'Unknown';
            $category = $response->checklistQuestion->inspectionCategory->name ?? 'Uncategorized';
            
            if (!isset($questionAnalysis[$questionId])) {
                $questionAnalysis[$questionId] = [
                    'question_id' => $questionId,
                    'question_text' => $questionText,
                    'category' => $category,
                    'expired_responses_count' => 0,
                    'conditional_fields_count' => 0,
                    'expired_conditional_fields_count' => 0,
                    'establishments_affected' => [],
                    'establishments_with_expired_conditional' => [],
                    'conditional_fields' => [],
                    'expired_conditional_fields' => []
                ];
            }
            
            $questionAnalysis[$questionId]['expired_responses_count']++;
            $establishmentName = $response->inspectionResult->establishment->name ?? 'Unknown';
            if (!in_array($establishmentName, $questionAnalysis[$questionId]['establishments_affected'])) {
                $questionAnalysis[$questionId]['establishments_affected'][] = $establishmentName;
            }
            if (!in_array($establishmentName, $questionAnalysis[$questionId]['establishments_with_expired_conditional'])) {
                $questionAnalysis[$questionId]['establishments_with_expired_conditional'][] = $establishmentName;
            }
        }

        // Count conditional fields per question and identify expired ones
        foreach ($conditionalFieldResponses as $fieldResponse) {
            $questionId = $fieldResponse->checklist_question_id;
            if (isset($questionAnalysis[$questionId])) {
                $questionAnalysis[$questionId]['conditional_fields_count']++;
                
                // Check if this conditional field is related to an expired checklist response
                $isExpiredConditional = false;
                foreach ($expiredChecklistResponses as $expiredResponse) {
                    if ($expiredResponse->checklist_question_id == $fieldResponse->checklist_question_id && 
                        $expiredResponse->inspection_result_id == $fieldResponse->inspection_result_id) {
                        $isExpiredConditional = true;
                        break;
                    }
                }
                
                $conditionalFieldData = [
                    'field_name' => $fieldResponse->field_name,
                    'field_value' => $fieldResponse->field_value,
                    'establishment_name' => $fieldResponse->inspectionResult->establishment->name ?? 'Unknown',
                    'question_text' => $fieldResponse->checklistQuestion->question ?? 'Unknown',
                    'question_id' => $fieldResponse->checklist_question_id,
                    'category' => $fieldResponse->checklistQuestion->inspectionCategory->name ?? 'Uncategorized',
                    'inspection_date' => $fieldResponse->inspectionResult->inspection->inspection_timestamp ?? 'Unknown',
                    'inspection_result_id' => $fieldResponse->inspection_result_id,
                    'inspection_id' => $fieldResponse->inspectionResult->inspection->id ?? 'Unknown',
                    'is_expired' => $isExpiredConditional
                ];
                
                $questionAnalysis[$questionId]['conditional_fields'][] = $conditionalFieldData;
                
                if ($isExpiredConditional) {
                    $questionAnalysis[$questionId]['expired_conditional_fields_count']++;
                    $questionAnalysis[$questionId]['expired_conditional_fields'][] = $conditionalFieldData;
                    
                    // Add establishment to expired list if not already there
                    $establishmentName = $fieldResponse->inspectionResult->establishment->name ?? 'Unknown';
                    if (!in_array($establishmentName, $questionAnalysis[$questionId]['establishments_with_expired_conditional'])) {
                        $questionAnalysis[$questionId]['establishments_with_expired_conditional'][] = $establishmentName;
                    }
                }
            }
        }

        return [
            'establishment_analysis' => array_values($establishmentAnalysis),
            'question_analysis' => array_values($questionAnalysis),
            'total_expired_items' => $expiredChecklistResponses->count(),
            'total_conditional_fields' => $conditionalFieldResponses->count(),
            'total_expired_conditional_fields' => array_sum(array_map(function($est) {
                return count($est['expired_conditional_questions'] ?? []);
            }, $establishmentAnalysis))
        ];
    }


    /**
     * Generate inspection reports.
     */
    private function generateInspectionReports($filters)
    {
        $query = InspectionResult::with(['inspection', 'establishment.businessType', 'checklistResponses.checklistQuestion']);

        // Apply date filters
        if (!empty($filters['date_from'])) {
            $query->whereHas('inspection', function($q) use ($filters) {
                $q->whereDate('inspection_timestamp', '>=', $filters['date_from']);
            });
        }
        if (!empty($filters['date_to'])) {
            $query->whereHas('inspection', function($q) use ($filters) {
                $q->whereDate('inspection_timestamp', '<=', $filters['date_to']);
            });
        }

        // Apply quarter filter
        if (!empty($filters['quarter'])) {
            $query->whereHas('inspection', function($q) use ($filters) {
                $q->where('quarter', $filters['quarter']);
            });
        }

        // Apply year filter
        if (!empty($filters['year'])) {
            $query->whereHas('inspection', function($q) use ($filters) {
                $q->whereYear('inspection_timestamp', $filters['year']);
            });
        }

        $inspectionResults = $query->get();

        // Get unique establishments with their latest inspection result
        $latestResults = $inspectionResults->groupBy('establishment_id')->map(function ($group) {
            return $group->sortByDesc('created_at')->first();
        });

        $totalInspections = $latestResults->count();
        $compliantCount = $latestResults->where('compliance_status', 'compliant')->count();
        $nonCompliantCount = $latestResults->where('compliance_status', 'not_compliant')->count();
        $pendingCount = $latestResults->where('compliance_status', 'pending')->count();

        // Analyze negative responses
        $negativeResponseAnalysis = $this->analyzeNegativeResponses($latestResults);

        // Generate quarterly trend data
        $quarterlyTrend = $this->generateQuarterlyTrend($filters);

        // Generate daily inspection data
        $dailyInspections = $this->generateDailyInspections($filters);

        return [
            [
                'id' => 'inspection-' . time(),
                'type' => 'inspection',
                'title' => 'Inspection Compliance Report',
                'description' => 'Overall compliance status of all inspections',
                'total_inspections' => $totalInspections,
                'compliant_count' => $compliantCount,
                'non_compliant_count' => $nonCompliantCount,
                'pending_count' => $pendingCount,
                'status' => $pendingCount > 0 ? 'pending' : ($nonCompliantCount > 0 ? 'non_compliant' : 'compliant'),
                'period_from' => $filters['date_from'] ?? now()->startOfYear()->toDateString(),
                'period_to' => $filters['date_to'] ?? now()->toDateString(),
                'quarter' => $filters['quarter'] ?? null,
                'created_at' => now()->toDateTimeString(),
                'negative_response_analysis' => $negativeResponseAnalysis,
                'quarterly_trend' => $quarterlyTrend,
                'daily_inspections' => $dailyInspections,
            ],
            [
                'id' => 'inspection-negative-' . time(),
                'type' => 'inspection_negative',
                'title' => 'Negative Response Analysis',
                'description' => 'Detailed analysis of negative responses by question',
                'total_inspections' => $totalInspections,
                'compliant_count' => $totalInspections - array_sum(array_column($negativeResponseAnalysis, 'negative_count')),
                'non_compliant_count' => array_sum(array_column($negativeResponseAnalysis, 'negative_count')),
                'pending_count' => 0,
                'status' => 'analysis',
                'period_from' => $filters['date_from'] ?? now()->startOfYear()->toDateString(),
                'period_to' => $filters['date_to'] ?? now()->toDateString(),
                'quarter' => $filters['quarter'] ?? null,
                'created_at' => now()->toDateTimeString(),
                'negative_response_analysis' => $negativeResponseAnalysis,
            ]
        ];
    }

    /**
     * Analyze negative responses from checklist responses.
     */
    private function analyzeNegativeResponses($inspectionResults)
    {
        $questionAnalysis = [];

        foreach ($inspectionResults as $result) {
            if ($result->checklistResponses) {
                foreach ($result->checklistResponses as $response) {
                    $questionId = $response->checklist_question_id;
                    $questionText = $response->checklistQuestion->question ?? 'Unknown Question';
                    
                    if (!isset($questionAnalysis[$questionId])) {
                        $questionAnalysis[$questionId] = [
                            'question_id' => $questionId,
                            'question_text' => $questionText,
                            'category' => $response->checklistQuestion->category ?? 'General',
                            'total_responses' => 0,
                            'negative_count' => 0,
                            'negative_percentage' => 0,
                            'establishments_with_negative' => []
                        ];
                    }

                    $questionAnalysis[$questionId]['total_responses']++;
                    
                    // Check if response is negative (assuming negative responses are stored as 'negative' or similar)
                    if ($response->response === 'negative' || 
                        (is_array($response->response) && in_array('negative', $response->response)) ||
                        strtolower($response->response) === 'no' ||
                        strtolower($response->response) === 'failed') {
                        
                        $questionAnalysis[$questionId]['negative_count']++;
                        
                        // Track which establishments had negative responses
                        if (!in_array($result->establishment->name, $questionAnalysis[$questionId]['establishments_with_negative'])) {
                            $questionAnalysis[$questionId]['establishments_with_negative'][] = $result->establishment->name;
                        }
                    }
                }
            }
        }

        // Calculate percentages and sort by negative count
        foreach ($questionAnalysis as &$analysis) {
            $analysis['negative_percentage'] = $analysis['total_responses'] > 0 
                ? round(($analysis['negative_count'] / $analysis['total_responses']) * 100, 2) 
                : 0;
        }

        // Sort by negative count (highest first)
        usort($questionAnalysis, function($a, $b) {
            return $b['negative_count'] <=> $a['negative_count'];
        });

        return array_values($questionAnalysis);
    }

    /**
     * Generate monitoring reports.
     */
    private function generateMonitoringReports($filters)
    {
        $query = Establishment::with(['businessType', 'inspectionResults.inspection']);

        // Apply date filters through inspection results
        if (!empty($filters['date_from']) || !empty($filters['date_to']) || !empty($filters['quarter']) || !empty($filters['year'])) {
            $query->whereHas('inspectionResults.inspection', function($q) use ($filters) {
                if (!empty($filters['date_from'])) {
                    $q->whereDate('inspection_timestamp', '>=', $filters['date_from']);
                }
                if (!empty($filters['date_to'])) {
                    $q->whereDate('inspection_timestamp', '<=', $filters['date_to']);
                }
                if (!empty($filters['quarter'])) {
                    $q->where('quarter', $filters['quarter']);
                }
                if (!empty($filters['year'])) {
                    $q->whereYear('inspection_timestamp', $filters['year']);
                }
            });
        }

        $establishments = $query->where('status', 'active')->get();

        $totalEstablishments = $establishments->count();
        $inspectedCount = $establishments->filter(function($establishment) {
            return $establishment->inspectionResults->count() > 0;
        })->count();
        $pendingCount = $totalEstablishments - $inspectedCount;

        return [
            [
                'id' => 'monitoring-' . time(),
                'type' => 'monitoring',
                'title' => 'Establishment Monitoring Report',
                'description' => 'Establishment inspection coverage and status',
                'total_inspections' => $totalEstablishments,
                'compliant_count' => $inspectedCount,
                'non_compliant_count' => 0,
                'pending_count' => $pendingCount,
                'status' => $pendingCount > 0 ? 'pending' : 'compliant',
                'period_from' => $filters['date_from'] ?? now()->startOfYear()->toDateString(),
                'period_to' => $filters['date_to'] ?? now()->toDateString(),
                'quarter' => $filters['quarter'] ?? null,
                'created_at' => now()->toDateTimeString(),
            ]
        ];
    }

    /**
     * Generate establishment reports.
     */
    private function generateEstablishmentReports($filters)
    {
        $query = Establishment::with(['businessType']);

        // Apply date filters if needed (establishment creation dates)
        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        $establishments = $query->get();

        $totalEstablishments = $establishments->count();
        $activeCount = $establishments->where('status', 'active')->count();
        $inactiveCount = $establishments->where('status', 'inactive')->count();
        $terminatedCount = $establishments->where('status', 'terminated')->count();

        // Group by business type
        $businessTypeStats = $establishments->groupBy('type_of_business_id')->map(function($group) {
            return [
                'count' => $group->count(),
                'business_type' => $group->first()->businessType->name ?? 'Unknown'
            ];
        });

        return [
            [
                'id' => 'establishment-' . time(),
                'type' => 'establishment',
                'title' => 'Establishment Summary Report',
                'description' => 'Overall establishment statistics and distribution',
                'total_inspections' => $totalEstablishments,
                'compliant_count' => $activeCount,
                'non_compliant_count' => $inactiveCount,
                'pending_count' => $terminatedCount,
                'status' => 'compliant',
                'period_from' => $filters['date_from'] ?? now()->startOfYear()->toDateString(),
                'period_to' => $filters['date_to'] ?? now()->toDateString(),
                'quarter' => $filters['quarter'] ?? null,
                'created_at' => now()->toDateTimeString(),
                'business_type_stats' => $businessTypeStats->toArray(),
            ]
        ];
    }

    /**
     * Export reports to different formats.
     */
    public function export(Request $request, $type)
    {
        $filters = $request->only(['date_from', 'date_to', 'quarter', 'year']);
        
        switch ($type) {
            case 'inspection':
                return $this->exportInspectionReports($filters);
            case 'monitoring':
                return $this->exportMonitoringReports($filters);
            case 'establishment':
                return $this->exportEstablishmentReports($filters);
            default:
                return response()->json(['error' => 'Invalid report type'], 400);
        }
    }

    /**
     * Export inspection reports as CSV.
     */
    private function exportInspectionReports($filters)
    {
        $query = InspectionResult::with(['inspection', 'establishment.businessType']);

        // Apply filters (same as in getData method)
        if (!empty($filters['date_from'])) {
            $query->whereHas('inspection', function($q) use ($filters) {
                $q->whereDate('inspection_timestamp', '>=', $filters['date_from']);
            });
        }
        if (!empty($filters['date_to'])) {
            $query->whereHas('inspection', function($q) use ($filters) {
                $q->whereDate('inspection_timestamp', '<=', $filters['date_to']);
            });
        }
        if (!empty($filters['quarter'])) {
            $query->whereHas('inspection', function($q) use ($filters) {
                $q->where('quarter', $filters['quarter']);
            });
        }
        if (!empty($filters['year'])) {
            $query->whereHas('inspection', function($q) use ($filters) {
                $q->whereYear('inspection_timestamp', $filters['year']);
            });
        }

        $results = $query->get();

        $filename = "inspection_reports_" . date('Y-m-d') . ".csv";
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function() use ($results) {
            $file = fopen('php://output', 'w');
            
            // CSV Header
            fputcsv($file, [
                'Establishment Name',
                'Business Type',
                'Inspection Date',
                'Quarter',
                'Compliance Status',
                'Inspector',
                'Remarks'
            ]);

            // CSV Data
            foreach ($results as $result) {
                fputcsv($file, [
                    $result->establishment->name ?? 'N/A',
                    $result->establishment->businessType->name ?? 'N/A',
                    $result->inspection->inspection_timestamp ?? 'N/A',
                    $result->inspection->quarter ?? 'N/A',
                    $result->compliance_status ?? 'N/A',
                    $result->staff ? ($result->staff->first_name . ' ' . $result->staff->last_name) : 'N/A',
                    $result->remarks ?? 'N/A'
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export monitoring reports as CSV.
     */
    private function exportMonitoringReports($filters)
    {
        $query = Establishment::with(['businessType', 'inspectionResults.inspection']);

        // Apply filters
        if (!empty($filters['date_from']) || !empty($filters['date_to']) || !empty($filters['quarter']) || !empty($filters['year'])) {
            $query->whereHas('inspectionResults.inspection', function($q) use ($filters) {
                if (!empty($filters['date_from'])) {
                    $q->whereDate('inspection_timestamp', '>=', $filters['date_from']);
                }
                if (!empty($filters['date_to'])) {
                    $q->whereDate('inspection_timestamp', '<=', $filters['date_to']);
                }
                if (!empty($filters['quarter'])) {
                    $q->where('quarter', $filters['quarter']);
                }
                if (!empty($filters['year'])) {
                    $q->whereYear('inspection_timestamp', $filters['year']);
                }
            });
        }

        $establishments = $query->where('status', 'active')->get();

        $filename = "monitoring_reports_" . date('Y-m-d') . ".csv";
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function() use ($establishments) {
            $file = fopen('php://output', 'w');
            
            // CSV Header
            fputcsv($file, [
                'Establishment Name',
                'Business Type',
                'Address',
                'Barangay',
                'Contact Number',
                'Status',
                'Last Inspection Date',
                'Inspection Count'
            ]);

            // CSV Data
            foreach ($establishments as $establishment) {
                $lastInspection = $establishment->inspectionResults->last();
                fputcsv($file, [
                    $establishment->name ?? 'N/A',
                    $establishment->businessType->name ?? 'N/A',
                    $establishment->address ?? 'N/A',
                    $establishment->Barangay ?? 'N/A',
                    $establishment->contact_number ?? 'N/A',
                    $establishment->status ?? 'N/A',
                    $lastInspection ? $lastInspection->inspection->inspection_timestamp : 'N/A',
                    $establishment->inspectionResults->count()
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export establishment reports as CSV.
     */
    private function exportEstablishmentReports($filters)
    {
        $query = Establishment::with(['businessType']);

        // Apply filters
        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        $establishments = $query->get();

        $filename = "establishment_reports_" . date('Y-m-d') . ".csv";
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function() use ($establishments) {
            $file = fopen('php://output', 'w');
            
            // CSV Header
            fputcsv($file, [
                'Establishment Name',
                'Business Type',
                'Address',
                'Barangay',
                'Contact Number',
                'Email',
                'Total Capacity',
                'Number of Rooms',
                'Number of Employees',
                'Status',
                'Created Date'
            ]);

            // CSV Data
            foreach ($establishments as $establishment) {
                fputcsv($file, [
                    $establishment->name ?? 'N/A',
                    $establishment->businessType->name ?? 'N/A',
                    $establishment->address ?? 'N/A',
                    $establishment->Barangay ?? 'N/A',
                    $establishment->contact_number ?? 'N/A',
                    $establishment->email ?? 'N/A',
                    $establishment->total_capacity ?? 'N/A',
                    $establishment->number_of_rooms ?? 'N/A',
                    $establishment->number_of_employees ?? 'N/A',
                    $establishment->status ?? 'N/A',
                    $establishment->created_at ?? 'N/A'
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Generate government reports.
     */
    private function generateGovernmentReports($filters)
    {
        $query = InspectionResult::with(['inspection', 'establishment.businessType', 'checklistResponses.checklistQuestion']);

        // Apply same filters as inspection reports
        if (!empty($filters['date_from'])) {
            $query->whereHas('inspection', function($q) use ($filters) {
                $q->whereDate('inspection_timestamp', '>=', $filters['date_from']);
            });
        }
        if (!empty($filters['date_to'])) {
            $query->whereHas('inspection', function($q) use ($filters) {
                $q->whereDate('inspection_timestamp', '<=', $filters['date_to']);
            });
        }
        if (!empty($filters['quarter'])) {
            $query->whereHas('inspection', function($q) use ($filters) {
                $q->where('quarter', $filters['quarter']);
            });
        }
        if (!empty($filters['year'])) {
            $query->whereHas('inspection', function($q) use ($filters) {
                $q->whereYear('inspection_timestamp', $filters['year']);
            });
        }

        $inspectionResults = $query->get();

        // Get unique establishments with their latest inspection result
        $latestResults = $inspectionResults->groupBy('establishment_id')->map(function ($group) {
            return $group->sortByDesc('created_at')->first();
        });

        // Government-specific metrics
        $totalEstablishments = $latestResults->count();
        $compliantEstablishments = $latestResults->where('compliance_status', 'compliant')->count();
        $nonCompliantEstablishments = $latestResults->where('compliance_status', 'not_compliant')->count();
        $pendingEstablishments = $totalEstablishments - $compliantEstablishments - $nonCompliantEstablishments;

        // Critical violations (high-priority negative responses)
        $criticalViolations = $this->identifyCriticalViolations($latestResults);

        return [
            [
                'id' => 'government-' . time(),
                'type' => 'government',
                'title' => 'Government Compliance Report',
                'description' => 'Official government compliance statistics and violations',
                'total_inspections' => $totalEstablishments,
                'compliant_count' => $compliantEstablishments,
                'non_compliant_count' => $nonCompliantEstablishments,
                'pending_count' => $pendingEstablishments,
                'status' => $pendingEstablishments > 0 ? 'pending' : ($nonCompliantEstablishments > 0 ? 'non_compliant' : 'compliant'),
                'period_from' => $filters['date_from'] ?? now()->startOfYear()->toDateString(),
                'period_to' => $filters['date_to'] ?? now()->toDateString(),
                'quarter' => $filters['quarter'] ?? null,
                'created_at' => now()->toDateTimeString(),
                'critical_violations' => $criticalViolations,
                'compliance_rate' => $totalEstablishments > 0 ? round(($compliantEstablishments / $totalEstablishments) * 100, 2) : 0,
            ]
        ];
    }

    /**
     * Generate professional reports.
     */
    private function generateProfessionalReports($filters)
    {
        $query = InspectionResult::with(['inspection', 'establishment.businessType', 'checklistResponses.checklistQuestion', 'staff']);

        // Apply same filters
        if (!empty($filters['date_from'])) {
            $query->whereHas('inspection', function($q) use ($filters) {
                $q->whereDate('inspection_timestamp', '>=', $filters['date_from']);
            });
        }
        if (!empty($filters['date_to'])) {
            $query->whereHas('inspection', function($q) use ($filters) {
                $q->whereDate('inspection_timestamp', '<=', $filters['date_to']);
            });
        }
        if (!empty($filters['quarter'])) {
            $query->whereHas('inspection', function($q) use ($filters) {
                $q->where('quarter', $filters['quarter']);
            });
        }
        if (!empty($filters['year'])) {
            $query->whereHas('inspection', function($q) use ($filters) {
                $q->whereYear('inspection_timestamp', $filters['year']);
            });
        }

        $inspectionResults = $query->get();

        // Get unique establishments with their latest inspection result
        $latestResults = $inspectionResults->groupBy('establishment_id')->map(function ($group) {
            return $group->sortByDesc('created_at')->first();
        });

        // Professional-specific metrics
        $inspectorPerformance = $this->analyzeInspectorPerformance($latestResults);
        $businessTypeAnalysis = $this->analyzeBusinessTypeCompliance($latestResults);
        $recommendations = $this->generateRecommendations($latestResults);

        return [
            [
                'id' => 'professional-' . time(),
                'type' => 'professional',
                'title' => 'Professional Analysis Report',
                'description' => 'Detailed professional analysis with recommendations',
                'total_inspections' => $latestResults->count(),
                'compliant_count' => $latestResults->where('compliance_status', 'compliant')->count(),
                'non_compliant_count' => $latestResults->where('compliance_status', 'not_compliant')->count(),
                'pending_count' => $latestResults->where('compliance_status', 'pending')->count(),
                'status' => 'analysis',
                'period_from' => $filters['date_from'] ?? now()->startOfYear()->toDateString(),
                'period_to' => $filters['date_to'] ?? now()->toDateString(),
                'quarter' => $filters['quarter'] ?? null,
                'created_at' => now()->toDateTimeString(),
                'inspector_performance' => $inspectorPerformance,
                'business_type_analysis' => $businessTypeAnalysis,
                'recommendations' => $recommendations,
            ]
        ];
    }

    /**
     * Identify critical violations from inspection results.
     */
    private function identifyCriticalViolations($inspectionResults)
    {
        $criticalViolations = [];

        foreach ($inspectionResults as $result) {
            if ($result->checklistResponses) {
                foreach ($result->checklistResponses as $response) {
                    // Identify critical questions (health, safety, legal requirements)
                    $questionText = strtolower($response->checklistQuestion->question ?? '');
                    
                    if (
                        (strpos($questionText, 'health') !== false || 
                         strpos($questionText, 'safety') !== false || 
                         strpos($questionText, 'fire') !== false ||
                         strpos($questionText, 'permit') !== false ||
                         strpos($questionText, 'license') !== false) &&
                        ($response->response === 'negative' || 
                         strtolower($response->response) === 'no' ||
                         strtolower($response->response) === 'failed')
                    ) {
                        $criticalViolations[] = [
                            'establishment_name' => $result->establishment->name,
                            'question' => $response->checklistQuestion->question,
                            'response' => $response->response,
                            'inspection_date' => $result->inspection->inspection_timestamp,
                            'severity' => 'critical'
                        ];
                    }
                }
            }
        }

        return $criticalViolations;
    }

    /**
     * Analyze inspector performance.
     */
    private function analyzeInspectorPerformance($inspectionResults)
    {
        $performance = [];

        foreach ($inspectionResults as $result) {
            if ($result->staff) {
                $inspectorId = $result->staff->id;
                $inspectorName = $result->staff->first_name . ' ' . $result->staff->last_name;
                
                if (!isset($performance[$inspectorId])) {
                    $performance[$inspectorId] = [
                        'inspector_name' => $inspectorName,
                        'total_inspections' => 0,
                        'compliant_inspections' => 0,
                        'non_compliant_inspections' => 0,
                        'pending_inspections' => 0,
                        'compliance_rate' => 0
                    ];
                }

                $performance[$inspectorId]['total_inspections']++;
                
                switch ($result->compliance_status) {
                    case 'compliant':
                        $performance[$inspectorId]['compliant_inspections']++;
                        break;
                    case 'not_compliant':
                        $performance[$inspectorId]['non_compliant_inspections']++;
                        break;
                    case 'pending':
                        $performance[$inspectorId]['pending_inspections']++;
                        break;
                }
            }
        }

        // Calculate compliance rates
        foreach ($performance as &$perf) {
            if ($perf['total_inspections'] > 0) {
                $perf['compliance_rate'] = round(($perf['compliant_inspections'] / $perf['total_inspections']) * 100, 2);
            }
        }

        return array_values($performance);
    }

    /**
     * Analyze business type compliance.
     */
    private function analyzeBusinessTypeCompliance($inspectionResults)
    {
        $businessTypeAnalysis = [];

        foreach ($inspectionResults as $result) {
            $businessTypeId = $result->establishment->type_of_business_id;
            $businessTypeName = $result->establishment->businessType->name ?? 'Unknown';
            
            if (!isset($businessTypeAnalysis[$businessTypeId])) {
                $businessTypeAnalysis[$businessTypeId] = [
                    'business_type' => $businessTypeName,
                    'total_inspections' => 0,
                    'compliant_inspections' => 0,
                    'non_compliant_inspections' => 0,
                    'pending_inspections' => 0,
                    'compliance_rate' => 0
                ];
            }

            $businessTypeAnalysis[$businessTypeId]['total_inspections']++;
            
            switch ($result->compliance_status) {
                case 'compliant':
                    $businessTypeAnalysis[$businessTypeId]['compliant_inspections']++;
                    break;
                case 'not_compliant':
                    $businessTypeAnalysis[$businessTypeId]['non_compliant_inspections']++;
                    break;
                case 'pending':
                    $businessTypeAnalysis[$businessTypeId]['pending_inspections']++;
                    break;
            }
        }

        // Calculate compliance rates
        foreach ($businessTypeAnalysis as &$analysis) {
            if ($analysis['total_inspections'] > 0) {
                $analysis['compliance_rate'] = round(($analysis['compliant_inspections'] / $analysis['total_inspections']) * 100, 2);
            }
        }

        return array_values($businessTypeAnalysis);
    }

    /**
     * Generate recommendations based on inspection results.
     */
    private function generateRecommendations($inspectionResults)
    {
        $recommendations = [];
        
        $totalInspections = $inspectionResults->count();
        $complianceRate = $totalInspections > 0 ? ($inspectionResults->where('compliance_status', 'compliant')->count() / $totalInspections) * 100 : 0;
        
        // Overall compliance recommendations
        if ($complianceRate < 70) {
            $recommendations[] = [
                'type' => 'critical',
                'title' => 'Low Overall Compliance Rate',
                'description' => 'Overall compliance is below 70%. Immediate action required.',
                'action' => 'Increase inspection frequency and provide compliance assistance to establishments.'
            ];
        } elseif ($complianceRate < 85) {
            $recommendations[] = [
                'type' => 'warning',
                'title' => 'Moderate Compliance Rate',
                'description' => 'Compliance rate is between 70-85%. Room for improvement.',
                'action' => 'Focus on high-risk establishments and provide targeted training.'
            ];
        }

        // Critical violations recommendations
        $criticalViolations = $this->identifyCriticalViolations($inspectionResults);
        if (count($criticalViolations) > 0) {
            $recommendations[] = [
                'type' => 'critical',
                'title' => 'Critical Violations Detected',
                'description' => count($criticalViolations) . ' critical violations found.',
                'action' => 'Immediate follow-up inspections required for all establishments with critical violations.'
            ];
        }

        return $recommendations;
    }

    /**
     * Generate quarterly trend data for inspections.
     */
    private function generateQuarterlyTrend($filters)
    {
        $year = $filters['year'] ?? date('Y');
        $quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
        $quarterlyData = [];

        foreach ($quarters as $quarter) {
            // Calculate date range for this quarter
            $quarterDates = $this->getQuarterDateRange($quarter, $year);
            
            $query = InspectionResult::with(['inspection', 'establishment'])
                ->whereHas('inspection', function($q) use ($quarterDates) {
                    $q->whereDate('inspection_timestamp', '>=', $quarterDates['start'])
                      ->whereDate('inspection_timestamp', '<=', $quarterDates['end']);
                });

            $results = $query->get();
            
            // Get unique establishments with their latest inspection result for this quarter
            $latestResults = $results->groupBy('establishment_id')->map(function ($group) {
                return $group->sortByDesc('created_at')->first();
            });

            $quarterlyData[$quarter] = [
                'total' => $latestResults->count(),
                'compliant' => $latestResults->where('compliance_status', 'compliant')->count(),
                'non_compliant' => $latestResults->where('compliance_status', 'not_compliant')->count(),
                'pending' => $latestResults->where('compliance_status', 'pending')->count(),
            ];
        }

        return $quarterlyData;
    }

    /**
     * Generate daily inspection data for the selected period.
     */
    private function generateDailyInspections($filters)
    {
        $query = InspectionResult::with(['inspection', 'establishment']);

        // Apply date filters
        if (!empty($filters['date_from'])) {
            $query->whereHas('inspection', function($q) use ($filters) {
                $q->whereDate('inspection_timestamp', '>=', $filters['date_from']);
            });
        }
        if (!empty($filters['date_to'])) {
            $query->whereHas('inspection', function($q) use ($filters) {
                $q->whereDate('inspection_timestamp', '<=', $filters['date_to']);
            });
        }

        // Apply quarter filter
        if (!empty($filters['quarter'])) {
            $query->whereHas('inspection', function($q) use ($filters) {
                $q->where('quarter', $filters['quarter']);
            });
        }

        // Apply year filter
        if (!empty($filters['year'])) {
            $query->whereHas('inspection', function($q) use ($filters) {
                $q->whereYear('inspection_timestamp', $filters['year']);
            });
        }

        $results = $query->get();
        
        // Group by inspection date and count inspections
        $dailyData = $results->groupBy(function($result) {
            return $result->inspection->inspection_timestamp->format('Y-m-d');
        })->map(function($dayResults) {
            // Get unique establishments for this date
            $uniqueEstablishments = $dayResults->groupBy('establishment_id')->map(function ($group) {
                return $group->sortByDesc('created_at')->first();
            });

            return [
                'total' => $uniqueEstablishments->count(),
                'compliant' => $uniqueEstablishments->where('compliance_status', 'compliant')->count(),
                'non_compliant' => $uniqueEstablishments->where('compliance_status', 'not_compliant')->count(),
                'pending' => $uniqueEstablishments->where('compliance_status', 'pending')->count(),
            ];
        })->sortKeys();

        return $dailyData->toArray();
    }

    /**
     * Get date range for a specific quarter.
     */
    private function getQuarterDateRange($quarter, $year)
    {
        switch ($quarter) {
            case 'Q1':
                return [
                    'start' => "$year-01-01",
                    'end' => "$year-03-31"
                ];
            case 'Q2':
                return [
                    'start' => "$year-04-01",
                    'end' => "$year-06-30"
                ];
            case 'Q3':
                return [
                    'start' => "$year-07-01",
                    'end' => "$year-09-30"
                ];
            case 'Q4':
                return [
                    'start' => "$year-10-01",
                    'end' => "$year-12-31"
                ];
            default:
                return [
                    'start' => "$year-01-01",
                    'end' => "$year-12-31"
                ];
        }
    }

    /**
     * Determine if a response is positive (compliant).
     */
    private function isPositiveResponse($response)
    {
        if (empty($response)) {
            \Log::info('Positive check: EMPTY response');
            return false;
        }
        
        $positiveIndicators = [
            'yes', 'compliant', 'pass', 'positive', 'ok', 'okay', 'approved', 
            'satisfactory', 'good', 'excellent', 'complete', 'done', 'true', '1',
            'present', 'available', 'installed', 'functional', 'working', 'operational'
        ];
        
        $responseStr = strtolower(trim($response));
        \Log::info('Positive check for: "' . $response . '" -> "' . $responseStr . '"');
        
        // Check for exact matches
        if (in_array($responseStr, $positiveIndicators)) {
            \Log::info('Positive match found (exact): ' . $responseStr);
            return true;
        }
        
        // Check for partial matches (e.g., "yes - with notes")
        foreach ($positiveIndicators as $indicator) {
            if (str_contains($responseStr, $indicator)) {
                \Log::info('Positive match found (partial): ' . $indicator . ' in ' . $responseStr);
                return true;
            }
        }
        
        // Check for numeric responses (1 = positive, 0 = negative)
        if (is_numeric($response)) {
            $isPositive = (int)$response === 1;
            \Log::info('Numeric positive check: ' . $response . ' -> ' . ($isPositive ? 'POSITIVE' : 'NOT POSITIVE'));
            return $isPositive;
        }
        
        \Log::info('No positive match found for: ' . $responseStr);
        return false;
    }

    /**
     * Determine if a response is negative (non-compliant).
     */
    private function isNegativeResponse($response)
    {
        if (empty($response)) {
            \Log::info('Negative check: EMPTY response');
            return false;
        }
        
        $negativeIndicators = [
            'no', 'non_compliant', 'fail', 'negative', 'not', 'disapproved', 
            'unsatisfactory', 'poor', 'incomplete', 'pending', 'false', '0',
            'violated', 'violation', 'issue', 'problem', 'deficiency',
            'non-present', 'absent', 'unavailable', 'not installed', 'non-functional', 'broken', 'malfunctioning'
        ];
        
        $responseStr = strtolower(trim($response));
        \Log::info('Negative check for: "' . $response . '" -> "' . $responseStr . '"');
        
        // Check for exact matches
        if (in_array($responseStr, $negativeIndicators)) {
            \Log::info('Negative match found (exact): ' . $responseStr);
            return true;
        }
        
        // Check for partial matches
        foreach ($negativeIndicators as $indicator) {
            if (str_contains($responseStr, $indicator)) {
                \Log::info('Negative match found (partial): ' . $indicator . ' in ' . $responseStr);
                return true;
            }
        }
        
        // Check for numeric responses
        if (is_numeric($response)) {
            $isNegative = (int)$response === 0;
            \Log::info('Numeric negative check: ' . $response . ' -> ' . ($isNegative ? 'NEGATIVE' : 'NOT NEGATIVE'));
            return $isNegative;
        }
        
        \Log::info('No negative match found for: ' . $responseStr);
        return false;
    }

    /**
     * Classify response type.
     */
    private function classifyResponse($response)
    {
        if (empty($response) || strtolower(trim($response)) === 'n/a' || str_contains(strtolower($response), 'not applicable')) {
            \Log::info('Classified as NA: ' . $response);
            return 'na';
        }
        
        // Check negative FIRST to avoid partial matches (e.g., "NON-PRESENT" contains "present")
        if ($this->isNegativeResponse($response)) {
            \Log::info('Classified as NEGATIVE: ' . $response);
            return 'negative';
        }
        
        if ($this->isPositiveResponse($response)) {
            \Log::info('Classified as POSITIVE: ' . $response);
            return 'positive';
        }
        
        // Default to neutral if unclear
        \Log::info('Classified as NEUTRAL: ' . $response);
        return 'neutral';
    }
}
