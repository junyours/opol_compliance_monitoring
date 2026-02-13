<?php

namespace App\Http\Controllers;

use App\Models\Utility;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UtilityController extends Controller
{
    public function index()
    {
        $utilities = Utility::latest()->get();
        
        return Inertia::render('Admin/Utilities', [
            'utilities' => $utilities
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'form_name' => 'required|string|max:255',
            'form_type' => 'required|string|max:255',
            'columns' => 'required|array',
            'columns.*.name' => 'required|string|max:255',
            'columns.*.type' => 'required|string|in:text,number,date,select,textarea',
            'columns.*.required' => 'boolean',
            'columns.*.options' => 'nullable|array',
            'rows' => 'nullable|array',
            'rows.*.name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        Utility::create($request->all());

        return redirect()->back()->with('success', 'Form structure created successfully!');
    }

    public function update(Request $request, Utility $utility)
    {
        $request->validate([
            'form_name' => 'required|string|max:255',
            'form_type' => 'required|string|max:255',
            'columns' => 'required|array',
            'columns.*.name' => 'required|string|max:255',
            'columns.*.type' => 'required|string|in:text,number,date,select,textarea',
            'columns.*.required' => 'boolean',
            'columns.*.options' => 'nullable|array',
            'rows' => 'nullable|array',
            'rows.*.name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        $utility->update($request->all());

        return redirect()->back()->with('success', 'Form structure updated successfully!');
    }

    public function destroy(Utility $utility)
    {
        $utility->delete();
        return redirect()->back()->with('success', 'Form structure deleted successfully!');
    }
}
