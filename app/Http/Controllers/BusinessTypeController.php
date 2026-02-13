<?php

namespace App\Http\Controllers;

use App\Models\BusinessType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BusinessTypeController extends Controller
{
    /**
     * Display the business types management page.
     */
    public function indexPage()
    {
        $businessTypes = BusinessType::orderBy('name')->get();
        return Inertia::render('Admin/BusinessTypes', [
            'businessTypes' => $businessTypes
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $businessTypes = BusinessType::orderBy('name')->get();
        return response()->json($businessTypes);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:business_types',
            'description' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        $businessType = BusinessType::create($validated);
        
        return redirect()->route('admin.business-types.index-page')
                         ->with('success', 'Business type created successfully!');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, BusinessType $businessType)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:business_types,name,' . $businessType->id,
            'description' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        $businessType->update($validated);
        
        return redirect()->route('admin.business-types.index-page')
                         ->with('success', 'Business type updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(BusinessType $businessType)
    {
        // Check if there are any establishments using this business type
        if ($businessType->establishments()->count() > 0) {
            return redirect()->route('admin.business-types.index-page')
                             ->with('error', 'Cannot delete business type. It is being used by establishments.');
        }

        $businessType->delete();
        
        return redirect()->route('admin.business-types.index-page')
                         ->with('success', 'Business type deleted successfully!');
    }

    /**
     * Get active business types for dropdown
     */
    public function active()
    {
        $businessTypes = BusinessType::active()->orderBy('name')->get();
        return response()->json($businessTypes);
    }
}
