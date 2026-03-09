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

    // Show establishments for staff
    public function staffIndex()
    {
        $establishments = Establishment::with('businessType')->get();
        $businessTypes = BusinessType::active()->orderBy('name')->get();
        
        return Inertia::render('Staffs/Establishments', [
            'establishments' => $establishments,
            'businessTypes' => $businessTypes
        ]);
    }

    // Store new establishment
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'proponent' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'contact_number' => [
                'nullable',
                'string',
                'regex:/^[0-9]{11}$/',
                'max:20'
            ],
            'email' => 'nullable|email|unique:establishments,email',
            'type_of_business_id' => 'nullable|exists:business_types,id',
            'Barangay' => 'nullable|string|max:255',
            'total_capacity' => 'nullable|integer|min:0',
            'number_of_rooms' => 'nullable|integer|min:0',
            'number_of_employees' => 'nullable|integer|min:0',
            'status' => 'nullable|in:active,inactive,terminated',
        ], [
            'contact_number.regex' => 'Contact number must be exactly 11 digits.',
        ]);

        // Check for duplicate name + business type combination
        if ($request->filled('name') && $request->filled('type_of_business_id')) {
            $existing = Establishment::where('name', $request->name)
                ->where('type_of_business_id', $request->type_of_business_id)
                ->first();
            
            if ($existing) {
                return redirect()->back()
                    ->withErrors(['name' => 'An establishment with this name and business type already exists.'])
                    ->withInput();
            }
        }

        Establishment::create($validated);

        // Redirect based on user role
        if (auth()->user()->role === 'staff') {
            return redirect()->route('staff.establishments.index')
                             ->with('success', 'Establishment created successfully!');
        }

        return redirect()->route('admin.establishments.index')
                         ->with('success', 'Establishment created successfully!');
    }


    // Update establishment
    public function update(Request $request, Establishment $establishment)
    {
        // Debug logging - check if method is called
        \Log::info('Update method called for establishment ID: ' . $establishment->id);
        
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'proponent' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'contact_number' => [
                'nullable',
                'string',
                'regex:/^[0-9]{11}$/',
                'max:20'
            ],
            'email' => 'nullable|email|unique:establishments,email,' . $establishment->id,
            'type_of_business_id' => 'nullable|exists:business_types,id',
            'Barangay' => 'nullable|string|max:255',
            'total_capacity' => 'nullable|integer|min:0',
            'number_of_rooms' => 'nullable|integer|min:0',
            'number_of_employees' => 'nullable|integer|min:0',
            'status' => 'nullable|in:active,inactive,terminated',
        ], [
            'contact_number.regex' => 'Contact number must be exactly 11 digits.',
        ]);

        // Check for duplicate name + business type combination (excluding current establishment)
        if ($request->filled('name') && $request->filled('type_of_business_id')) {
            $existing = Establishment::where('name', $request->name)
                ->where('type_of_business_id', $request->type_of_business_id)
                ->where('id', '!=', $establishment->id)
                ->first();
            
            if ($existing) {
                return redirect()->back()
                    ->withErrors(['name' => 'An establishment with this name and business type already exists.'])
                    ->withInput();
            }
        }

        // Debug logging
        \Log::info('Validation passed');
        \Log::info('Validated data: ', $validated);

        $result = $establishment->update($validated);
        
        \Log::info('Update result: ' . ($result ? 'success' : 'failed'));
        \Log::info('Establishment after update: ', $establishment->fresh()->toArray());

        // Redirect based on user role
        if (auth()->user()->role === 'staff') {
            return redirect()->route('staff.establishments.index')
                             ->with('success', 'Establishment updated successfully!');
        }

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
