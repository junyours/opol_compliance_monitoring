<?php

namespace App\Http\Controllers;

use Log;
use App\Models\User;
use Inertia\Inertia;
use App\Models\Staff;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class StaffController extends Controller
{
    public function index(Request $request)
    {
        $query = Staff::with('user');

        // Search functionality
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('position', 'like', "%{$search}%");
            })->orWhereHas('user', function($q) use ($search) {
                $q->where('email', 'like', "%{$search}%");
            });
        }

        // Filter by department
        if ($request->has('department') && $request->get('department')) {
            $query->where('department', $request->get('department'));
        }

        // Filter by status
        if ($request->has('status') && $request->get('status')) {
            $query->where('status', $request->get('status'));
        }

        $staffs = $query->latest()->paginate(10);
        $departments = Staff::distinct()->pluck('department')->filter();

        return Inertia::render('Admin/CreateStaff', [
            'staffs' => $staffs,
            'departments' => $departments,
            'filters' => $request->only(['search', 'department', 'status'])
        ]);
    }

    public function store(Request $request)
    {
        try {
            // Log incoming data for debugging
            Log::info('Staff creation request data: ' . json_encode($request->all()));
            
            $request->validate([
                // User account validation
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:8|confirmed',
                
                // Staff profile validation
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'phone' => 'nullable|string|max:20',
                'position' => 'nullable|string|max:255',
                'department' => 'nullable|string|max:255',
                'hire_date' => 'nullable|date',
                'status' => 'required|in:active,inactive,terminated,deactive',
                'address' => 'nullable|string',
                'notes' => 'nullable|string'
            ]);

            // Create user account first
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'staff'
            ]);

            // Then create staff profile
            try {
                $staff = Staff::create([
                    'user_id' => $user->id,
                    'first_name' => $request->first_name,
                    'last_name' => $request->last_name,
                    'phone' => $request->phone,
                    'position' => $request->position,
                    'department' => $request->department,
                    'hire_date' => $request->hire_date,
                    'status' => $request->status,
                    'address' => $request->address,
                    'notes' => $request->notes
                ]);
                
                Log::info('Staff profile created successfully: ' . json_encode($staff));
            } catch (\Exception $e) {
                Log::error('Staff profile creation failed: ' . $e->getMessage());
                throw $e;
            }

            return redirect()->back()->with('success', 'Staff member created successfully!');
        } catch (\Exception $e) {
            // Log the error for debugging
            Log::error('Staff creation failed: ' . $e->getMessage());
            
            // Return with error message
            return redirect()->back()
                ->with('error', 'Failed to create staff member: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function update(Request $request, Staff $staff)
    {
        $request->validate([
            // User account validation
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $staff->user_id,
            'password' => 'nullable|string|min:8|confirmed',
            
            // Staff profile validation
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'position' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'hire_date' => 'nullable|date',
            'status' => 'required|in:active,inactive,terminated,deactive',
            'address' => 'nullable|string',
            'notes' => 'nullable|string'
        ]);

        // Update user account
        $userData = [
            'name' => $request->name,
            'email' => $request->email
        ];

        if ($request->filled('password')) {
            $userData['password'] = Hash::make($request->password);
        }

        $staff->user->update($userData);

        // Update staff profile
        $staff->update([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'phone' => $request->phone,
            'position' => $request->position,
            'department' => $request->department,
            'hire_date' => $request->hire_date,
            'status' => $request->status,
            'address' => $request->address,
            'notes' => $request->notes
        ]);

        return redirect()->back()->with('success', 'Staff member updated successfully!');
    }

    public function deactivate(Staff $staff)
    {
        // Soft delete by setting status to 'inactive'
        $staff->update(['status' => 'inactive']);
        
        return redirect()->back()->with('success', 'Staff member deactivated successfully!');
    }

    public function destroy(Staff $staff)
    {
        // This will cascade delete the user due to foreign key constraint
        $staff->delete();
        return redirect()->back()->with('success', 'Staff member deleted successfully!');
    }
}
