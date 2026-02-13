<?php

namespace App\Http\Controllers;

use App\Models\Inspection;
use App\Models\Staff;
use App\Models\Establishment;
use App\Models\ChecklistQuestion;
use App\Models\Utility;
use App\Models\InspectionCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StaffScheduleController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $staff = Staff::where('user_id', $user->id)->first();
        
        // Get all inspections for the staff member
        $inspections = Inspection::orderBy('inspection_timestamp', 'asc')->get();
        
        // Group inspections by month for better organization
        $groupedInspections = $inspections->groupBy(function($inspection) {
            return $inspection->inspection_timestamp->format('F Y');
        });

        // Get upcoming inspections (next 7 days)
        $upcomingInspections = Inspection::where('inspection_timestamp', '>=', now())
            ->where('inspection_timestamp', '<=', now()->addDays(7))
            ->orderBy('inspection_timestamp', 'asc')
            ->get();

        // Get today's inspections
        $todayInspections = Inspection::whereDate('inspection_timestamp', today())
            ->orderBy('inspection_timestamp', 'asc')
            ->get();

        return Inertia::render('Staffs/Schedule', [
            'inspections' => $inspections,
            'groupedInspections' => $groupedInspections,
            'upcomingInspections' => $upcomingInspections,
            'todayInspections' => $todayInspections,
            'staff' => $staff,
            'stats' => [
                'total' => $inspections->count(),
                'today' => $todayInspections->count(),
                'upcoming' => $upcomingInspections->count(),
                'completed' => $inspections->where('inspection_timestamp', '<', now())->count(),
            ]
        ]);
    }

    public function create($inspectionId)
    {
        $inspection = Inspection::findOrFail($inspectionId);
        
        // Get all active establishments that haven't been inspected for this inspection
        $establishments = Establishment::where('status', 'active')
            ->whereDoesntHave('inspectionResults', function ($query) use ($inspectionId) {
                $query->where('inspection_id', $inspectionId);
            })
            ->get();
        
        // Get all checklist questions with their categories
        $checklistQuestions = ChecklistQuestion::with('category')
            ->orderBy('category_id')
            ->orderBy('id')
            ->get();
        
        // Ensure conditional logic is properly cast
        $checklistQuestions->each(function ($question) {
            // Handle options if they're stored as JSON strings
            if ($question->options && is_string($question->options)) {
                $decoded = json_decode($question->options, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $question->options = $decoded;
                }
            }
            
            // Handle conditional logic if stored as JSON string
            if ($question->is_conditional && $question->conditional_logic) {
                if (is_string($question->conditional_logic)) {
                    $decoded = json_decode($question->conditional_logic, true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $question->conditional_logic = $decoded;
                    }
                }
            }
        });
        
        // Group questions by category
        $groupedQuestions = $checklistQuestions->groupBy('category.name');
        
        // Get utilities for forms
        $utilities = Utility::where('is_active', true)->get();
        
        // Get all categories
        $categories = InspectionCategory::orderBy('name')->get();

        return Inertia::render('Staffs/InspectionForm', [
            'inspection' => $inspection,
            'establishments' => $establishments,
            'checklistQuestions' => $checklistQuestions,
            'groupedQuestions' => $groupedQuestions,
            'utilities' => $utilities,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'inspection_id' => 'required|exists:inspections,id',
            'establishment_id' => 'required|exists:establishments,id',
            'checklist_responses' => 'required|array',
            'checklist_responses.*.question_id' => 'required|exists:checklist_questions,id',
            'checklist_responses.*.response' => 'required|string',
            'checklist_responses.*.notes' => 'nullable|string',
            'utility_data' => 'nullable|array',
            'overall_score' => 'nullable|integer|min:0|max:100',
            'recommendations' => 'nullable|string',
        ]);

        // Here you would save the inspection results to the database
        // This is a placeholder for the actual implementation
        
        return redirect()->route('staff.schedule')
            ->with('success', 'Inspection completed successfully!');
    }
}
