<?php

namespace App\Http\Controllers;

use App\Models\Establishment;
use App\Models\BusinessType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EstablishmentController extends Controller
{
    // Show all establishments
    public function index()
    {
        $establishments = Establishment::with('businessType')->get();
        $businessTypes = BusinessType::active()->orderBy('name')->get();
        
        return Inertia::render('Admin/Establishments', [
            'establishments' => $establishments,
            'businessTypes' => $businessTypes
        ]);
    }

    // Store new establishment
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'proponent' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'contact_number' => 'required|string|max:20',
            'email' => 'required|email|unique:establishments,email',
            'type_of_business_id' => 'required|exists:business_types,id',
            'Barangay' => 'required|string|max:255',
            'total_capacity' => 'required|integer|min:0',
            'number_of_rooms' => 'required|integer|min:0',
            'number_of_employees' => 'required|integer|min:0',
            'status' => 'required|in:active,inactive,terminated',
        ]);

        Establishment::create($validated);

        return redirect()->route('admin.establishments.index')
                         ->with('success', 'Establishment created successfully!');
    }


    // Update establishment
    public function update(Request $request, Establishment $establishment)
    {
        // Debug logging - check if method is called
        \Log::info('Update method called for establishment ID: ' . $establishment->id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'proponent' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'contact_number' => 'required|string|max:20',
            'email' => 'required|email|unique:establishments,email,' . $establishment->id,
            'type_of_business_id' => 'required|exists:business_types,id',
            'Barangay' => 'required|string|max:255',
            'total_capacity' => 'required|integer|min:0',
            'number_of_rooms' => 'required|integer|min:0',
            'number_of_employees' => 'required|integer|min:0',
            'status' => 'required|in:active,inactive,terminated',
        ]);

        // Debug logging
        \Log::info('Validation passed');
        \Log::info('Validated data: ', $validated);

        $result = $establishment->update($validated);
        
        \Log::info('Update result: ' . ($result ? 'success' : 'failed'));
        \Log::info('Establishment after update: ', $establishment->fresh()->toArray());

        return redirect()->route('admin.establishments.index')
                         ->with('success', 'Establishment updated successfully!');
    }

    // Soft delete establishment (set to inactive)
    public function deactivate(Establishment $establishment)
    {
        $establishment->update(['status' => 'inactive']);
        
        return redirect()->route('admin.establishments.index')
                         ->with('success', 'Establishment deactivated successfully!');
    }

    // Delete establishment
    public function destroy(Establishment $establishment)
    {
        $establishment->delete();
        return redirect()->route('admin.establishments.index')
                         ->with('success', 'Establishment deleted successfully!');
    }
}
