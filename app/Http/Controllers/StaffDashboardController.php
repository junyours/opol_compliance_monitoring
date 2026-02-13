<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Staff;
use App\Models\Inspection;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StaffDashboardController extends Controller
{
    public function dashboard()
    {
        $user = auth()->user();
        $staff = Staff::where('user_id', $user->id)->first();
        
        if (!$staff) {
            // Handle case where staff record doesn't exist
            return Inertia::render('Staffs/StaffDashboard', [
                'user' => $user,
                'staff' => null,
                'stats' => [
                    'total_inspections' => 0,
                    'pending_tasks' => 0,
                    'completed_tasks' => 0,
                    'upcoming_inspections' => 0,
                ],
                'todayInspections' => [],
                'upcomingInspections' => [],
                'recentInspections' => []
            ]);
        }
        
        // Get inspections assigned to this staff through InspectionResult
        $staffInspectionIds = \App\Models\InspectionResult::where('staff_id', $staff->id)
            ->pluck('inspection_id');
        
        // Get staff's inspections
        $staffInspections = Inspection::whereIn('id', $staffInspectionIds);
        
        // Get today's inspections for this staff
        $todayInspections = Inspection::whereIn('id', $staffInspectionIds)
            ->whereDate('inspection_timestamp', today())
            ->orderBy('inspection_timestamp', 'asc')
            ->get();
        
        // Get upcoming inspections for this staff (next 7 days)
        $upcomingInspections = Inspection::whereIn('id', $staffInspectionIds)
            ->where('inspection_timestamp', '>=', now())
            ->where('inspection_timestamp', '<=', now()->addDays(7))
            ->orderBy('inspection_timestamp', 'asc')
            ->get();
        
        // Get recent inspections for this staff (past 7 days)
        $recentInspections = Inspection::whereIn('id', $staffInspectionIds)
            ->where('inspection_timestamp', '>=', now()->subDays(7))
            ->where('inspection_timestamp', '<', now())
            ->orderBy('inspection_timestamp', 'desc')
            ->take(5)
            ->get();
        
        // Calculate user-specific statistics
        $stats = [
            'total_inspections' => $staffInspections->count(),
            'pending_tasks' => $upcomingInspections->count(),
            'completed_tasks' => Inspection::whereIn('id', $staffInspectionIds)
                ->where('inspection_timestamp', '<', now())
                ->count(),
            'upcoming_inspections' => $upcomingInspections->count(),
        ];
        
        return Inertia::render('Staffs/StaffDashboard', [
            'user' => $user,
            'staff' => $staff,
            'stats' => $stats,
            'todayInspections' => $todayInspections,
            'upcomingInspections' => $upcomingInspections,
            'recentInspections' => $recentInspections
        ]);
    }
}
