<?php

namespace App\Http\Controllers;

use App\Models\ChecklistQuestion;
use App\Models\InspectionCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChecklistQuestionController extends Controller
{
    // Show all categories with checklist links
    public function showAllCategories()
    {
        $categories = InspectionCategory::with('questions')->get();
        
        return Inertia::render('Admin/Checklist', [
            'categories' => $categories
        ]);
    }

    // Show checklist questions for a category
    public function index(InspectionCategory $category)
    {
        $questions = $category->questions()->get();
        $categories = InspectionCategory::with('questions')->get();

        return Inertia::render('Admin/Checklist', [
            'category' => $category,
            'questions' => $questions,
            'categories' => $categories,
        ]);
    }

    // Store new checklist question
    public function store(Request $request, InspectionCategory $category)
    {
        try {
            \Log::info('Store question request data:', $request->all());
            
            $request->validate([
                'question' => 'required|string|max:255',
                'type' => 'required|string|in:text,textarea,radio,checkbox',
                'options' => 'required_if:type,radio,checkbox|array',
                'options.*.text' => 'required|string',
                'options.*.type' => 'required|string|in:positive,negative,neutral',
                'is_conditional' => 'boolean',
                'conditional_logic' => 'nullable|array',
            ]);

            $questionData = [
                'question' => $request->question,
                'type' => $request->type,
                'options' => in_array($request->type, ['radio', 'checkbox']) 
                    ? array_filter($request->options, function($option) {
                        return !empty(trim($option['text'] ?? ''));
                    })
                    : null,
                'is_conditional' => $request->is_conditional ?? false,
                'conditional_logic' => $request->is_conditional ? $request->conditional_logic : null,
            ];

            \Log::info('Question data to be created:', $questionData);
            
            $question = $category->questions()->create($questionData);
            
            \Log::info('Question created successfully:', ['question_id' => $question->id]);

            return redirect()->back()->with('success', 'Question added successfully!');
        } catch (\Exception $e) {
            \Log::error('Error creating question:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->back()->with('error', 'Failed to add question: ' . $e->getMessage());
        }
    }

    // Delete question
    public function destroy(ChecklistQuestion $checklistQuestion)
    {
        $checklistQuestion->delete();
        return redirect()->back()->with('success', 'Question deleted successfully!');
    }

    // Update question
    public function update(Request $request, ChecklistQuestion $checklistQuestion)
    {
        $request->validate([
            'question' => 'required|string|max:255',
            'type' => 'required|string|in:text,textarea,radio,checkbox',
            'options' => 'required_if:type,radio,checkbox|array',
            'options.*.text' => 'required|string',
            'options.*.type' => 'required|string|in:positive,negative,neutral',
            'is_conditional' => 'boolean',
            'conditional_logic' => 'nullable|array',
        ]);

        $updateData = [
            'question' => $request->question,
            'type' => $request->type,
            'options' => in_array($request->type, ['radio', 'checkbox']) 
                ? array_filter($request->options, function($option) {
                    return !empty(trim($option['text'] ?? ''));
                })
                : null,
            'is_conditional' => $request->is_conditional ?? false,
            'conditional_logic' => $request->is_conditional ? $request->conditional_logic : null,
        ];

        $checklistQuestion->update($updateData);

        return redirect()->back()->with('success', 'Question updated successfully!');
    }

    // Submit questionnaire responses
    public function submit(Request $request, InspectionCategory $category)
    {
        $request->validate([
            'responses' => 'required|array',
            'responses.*' => 'required|string',
        ]);

        // Here you would typically save the responses to a database table
        // For now, we'll just return a success message
        return redirect()->back()->with('success', 'Questionnaire submitted successfully!');
    }
}
