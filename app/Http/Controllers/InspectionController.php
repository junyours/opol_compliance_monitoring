<?php

namespace App\Http\Controllers;

use App\Models\Inspection;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InspectionController extends Controller
{
    // Display all inspections
    public function index()
    {
        $inspections = Inspection::latest()->get();
        
        return Inertia::render('Admin/OpenInspection', [
            'inspections' => $inspections
        ]);
    }

    // Store new inspection
    public function store(Request $request)
    {
        $validated = $request->validate([
            'quarter' => 'required|string|in:Q1,Q2,Q3,Q4',
            'inspection_timestamp' => 'required|date',
            'notes' => 'nullable|string'
        ]);

        Inspection::create($validated);

        return redirect()->back()->with('success', 'Inspection scheduled successfully!');
    }

    // Update inspection
    public function update(Request $request, Inspection $inspection)
    {
        $validated = $request->validate([
            'quarter' => 'required|string|in:Q1,Q2,Q3,Q4',
            'inspection_timestamp' => 'required|date',
            'notes' => 'nullable|string'
        ]);

        $inspection->update($validated);

        return redirect()->back()->with('success', 'Inspection updated successfully!');
    }

    // Delete inspection
    public function destroy(Inspection $inspection)
    {
        $inspection->delete();
        return redirect()->back()->with('success', 'Inspection deleted successfully!');
    }
}
