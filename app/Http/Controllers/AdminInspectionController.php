<?php

namespace App\Http\Controllers;

use App\Models\InspectionResult;
use App\Models\InspectionChecklistResponse;
use App\Models\InspectionUtilityData;
use App\Models\ConditionalFieldResponse;
use App\Models\Inspection;
use App\Models\Establishment;
use App\Models\ChecklistQuestion;
use App\Models\Utility;
use App\Models\InspectionCategory;
use App\Models\Staff;
use App\Models\BusinessType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminInspectionController extends Controller
{
    /**
     * Show the form for creating a new manual inspection entry.
     */
    public function create()
    {
        // Get all active establishments with business type
        $establishments = Establishment::with('businessType')
            ->where('status', 'active')
            ->get();
        
        // Get all active business types
        $businessTypes = BusinessType::active()->get();
        
        // Get all active staff members for inspector selection
        $staff = Staff::where('status', 'active')->get();
        
        // Get all checklist questions with categories
        $checklistQuestions = ChecklistQuestion::with('category')
            ->orderBy('category_id')
            ->orderBy('id')
            ->get();
        
        // Group questions by category
        $groupedQuestions = $checklistQuestions->groupBy('category.name');
        
        // Get active utilities
        $utilities = Utility::where('is_active', true)->get();
        
        // Get all categories
        $categories = InspectionCategory::orderBy('name')->get();

        // Get existing inspection dates and times for dropdown
        $existingInspections = Inspection::orderBy('inspection_timestamp', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($inspection) {
                return [
                    'id' => $inspection->id,
                    'date' => $inspection->inspection_timestamp->format('Y-m-d'),
                    'time' => $inspection->inspection_timestamp->format('H:i'),
                    'quarter' => $inspection->quarter,
                    'display' => $inspection->inspection_timestamp->format('M d, Y - h:i A') . ' (' . $inspection->quarter . ')'
                ];
            });

        return Inertia::render('Admin/AdminInspectionForm', [
            'establishments' => $establishments,
            'businessTypes' => $businessTypes,
            'staff' => $staff,
            'checklistQuestions' => $checklistQuestions,
            'groupedQuestions' => $groupedQuestions,
            'utilities' => $utilities,
            'categories' => $categories,
            'existingInspections' => $existingInspections,
        ]);
    }

    /**
     * Store a manually created inspection result.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'establishment_id' => 'required|exists:establishments,id',
            'inspection_date' => 'required|date',
            'inspection_time' => 'required|string',
            'quarter' => 'required|string|in:Q1,Q2,Q3,Q4',
            'inspector_id' => 'required|exists:staffs,id',
            'existing_inspection_id' => 'nullable|exists:inspections,id',
            'checklist_responses' => 'required|array',
            'compliance_status' => 'nullable|string|in:compliant,not_compliant',
            'automated_recommendations' => 'nullable|array',
            'checklist_responses.*.question_id' => 'required|exists:checklist_questions,id',
            'checklist_responses.*.response' => 'required|string',
            'checklist_responses.*.notes' => 'nullable|string',
            'checklist_responses.*.remarks' => 'nullable|string',
            'utility_data' => 'nullable|array',
            'conditional_fields' => 'nullable|array',
            'other_remarks' => 'nullable|string',
            'recommendations' => 'nullable|string',
            'recommendation_checks' => 'nullable|array',
            'recommendation_checks.comply_lacking_permits' => 'boolean',
            'recommendation_checks.provide_lacking_facilities' => 'boolean',
            'recommendation_checks.others' => 'boolean',
        ]);

        try {
            DB::beginTransaction();

            // Log incoming data
            \Log::info('=== Manual Inspection Store ===');
            \Log::info('All request data:', ['data' => $request->all()]);
            \Log::info('Validated data:', ['data' => $validated]);
            \Log::info('Existing inspection ID: ' . ($validated['existing_inspection_id'] ?? 'null'));
            \Log::info('Date selection mode check: ' . (!empty($validated['existing_inspection_id']) ? 'existing' : 'new'));

            // Use existing inspection or create new one
            if (!empty($validated['existing_inspection_id'])) {
                // Use existing inspection
                \Log::info('Using existing inspection ID: ' . $validated['existing_inspection_id']);
                $inspection = Inspection::find($validated['existing_inspection_id']);
                if (!$inspection) {
                    \Log::error('Existing inspection not found: ' . $validated['existing_inspection_id']);
                    throw new \Exception('Existing inspection not found');
                }
            } else {
                // Create a new inspection record for manual entry
                \Log::info('Creating new inspection record');
                \Log::info('Date: ' . $validated['inspection_date']);
                \Log::info('Time: ' . $validated['inspection_time']);
                
                // Try to create proper datetime format
                try {
                    $inspectionDateTime = \DateTime::createFromFormat('Y-m-d H:i', $validated['inspection_date'] . ' ' . $validated['inspection_time']);
                    $formattedDateTime = $inspectionDateTime->format('Y-m-d H:i:s');
                    \Log::info('Formatted datetime: ' . $formattedDateTime);
                    
                    $inspection = Inspection::create([
                        'inspection_timestamp' => $formattedDateTime,
                        'quarter' => $validated['quarter'],
                    ]);
                    \Log::info('New inspection created with ID: ' . $inspection->id);
                } catch (\Exception $e) {
                    \Log::error('DateTime creation failed: ' . $e->getMessage());
                    // Fallback to simple concatenation
                    $inspection = Inspection::create([
                        'inspection_timestamp' => $validated['inspection_date'] . ' ' . $validated['inspection_time'] . ':00',
                        'quarter' => $validated['quarter'],
                    ]);
                    \Log::info('New inspection created with fallback ID: ' . $inspection->id);
                }
            }

            // Create inspection result
            \Log::info('Creating inspection result', ['inspection_id' => $inspection->id]);
            $inspectionResult = InspectionResult::create([
                'inspection_id' => $inspection->id,
                'establishment_id' => $validated['establishment_id'],
                'staff_id' => $validated['inspector_id'],
                'other_remarks' => $validated['other_remarks'] ?? null,
                'recommendations' => $validated['recommendations'] ?? null,
                'comply_lacking_permits' => $validated['recommendation_checks']['comply_lacking_permits'] ?? false,
                'provide_lacking_facilities' => $validated['recommendation_checks']['provide_lacking_facilities'] ?? false,
                'others_recommendation' => $validated['recommendation_checks']['others'] ?? false,
                'status' => 'submitted',
                'compliance_status' => $validated['compliance_status'] ?? null,
                'automated_recommendations' => $validated['automated_recommendations'] ?? null,
            ]);
            \Log::info('Inspection result created successfully', ['id' => $inspectionResult->id, 'inspection_id' => $inspectionResult->inspection_id]);
            \Log::info('Inspection result created', ['id' => $inspectionResult->id]);

            // Store checklist responses
            foreach ($validated['checklist_responses'] as $response) {
                InspectionChecklistResponse::create([
                    'inspection_result_id' => $inspectionResult->id,
                    'checklist_question_id' => $response['question_id'],
                    'response' => $response['response'],
                    'notes' => $response['notes'] ?? null,
                    'remarks' => $response['remarks'] ?? null,
                ]);
            }

            // Store utility data
            if (!empty($validated['utility_data'])) {
                foreach ($validated['utility_data'] as $utilityId => $data) {
                    if (!empty($data)) {
                        InspectionUtilityData::create([
                            'inspection_result_id' => $inspectionResult->id,
                            'utility_id' => $utilityId,
                            'data' => $data,
                        ]);
                    }
                }
            }

            // Store conditional field responses
            if (!empty($validated['conditional_fields'])) {
                foreach ($validated['conditional_fields'] as $questionId => $fields) {
                    foreach ($fields as $fieldName => $fieldValue) {
                        ConditionalFieldResponse::create([
                            'inspection_result_id' => $inspectionResult->id,
                            'checklist_question_id' => $questionId,
                            'field_name' => $fieldName,
                            'field_value' => $fieldValue,
                        ]);
                    }
                }
            }

            DB::commit();

            return redirect()
                ->route('admin.inspection.create')
                ->with('success', 'Manual inspection entry created successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            
            \Log::error('=== Manual Inspection Store Error ===');
            \Log::error('Error message: ' . $e->getMessage());
            \Log::error('Error trace: ' . $e->getTraceAsString());
            
            return back()
                ->withInput()
                ->with('error', 'Failed to save manual inspection entry: ' . $e->getMessage());
        }
    }
}
