<?php

namespace App\Http\Controllers;

use App\Models\Establishment;
use App\Models\InspectionResult;
use App\Models\Inspection;
use App\Models\Staff;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function index()
    {
        // Get total establishments
        $totalEstablishments = Establishment::count();
        
        // Get total inspections completed
        $totalInspections = InspectionResult::count();
        
        // Get pending inspections (draft status)
        $pendingInspections = InspectionResult::where('status', 'draft')->count();
        
        // Get compliant vs non-compliant establishments
        $compliantEstablishments = InspectionResult::where('compliance_status', 'compliant')
            ->distinct('establishment_id')
            ->count('establishment_id');
            
        $nonCompliantEstablishments = InspectionResult::where('compliance_status', 'not_compliant')
            ->distinct('establishment_id')
            ->count('establishment_id');
        
        // Get staff statistics
        $totalStaff = Staff::count();
        $activeStaff = Staff::whereHas('user', function($query) {
            $query->where('email_verified_at', '!=', null);
        })->count();
        
        // Calculate recent growth (new establishments in last 30 days)
        $recentGrowth = Establishment::where('created_at', '>=', now()->subDays(30))
            ->count();
        $growthPercentage = $totalEstablishments > 0 
            ? round(($recentGrowth / $totalEstablishments) * 100, 1) 
            : 0;
        
        // Get recent activities
        $recentActivities = $this->getRecentActivities();
        
        // Get upcoming inspections
        $upcomingInspections = $this->getUpcomingInspections();
        
        $stats = [
            'totalEstablishments' => $totalEstablishments,
            'totalInspections' => $totalInspections,
            'pendingInspections' => $pendingInspections,
            'compliantEstablishments' => $compliantEstablishments,
            'nonCompliantEstablishments' => $nonCompliantEstablishments,
            'totalStaff' => $totalStaff,
            'activeStaff' => $activeStaff,
            'recentGrowth' => $growthPercentage,
        ];
        
        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'recentActivities' => $recentActivities,
            'upcomingInspections' => $upcomingInspections,
        ]);
    }
    
    /**
     * Get recent activities for the dashboard.
     */
    private function getRecentActivities()
    {
        $activities = collect();
        
        // Recent inspections completed
        $recentInspections = InspectionResult::with(['establishment', 'staff.user'])
            ->where('status', 'submitted')
            ->orderBy('updated_at', 'desc')
            ->limit(3)
            ->get();
            
        foreach ($recentInspections as $inspection) {
            $activities->push([
                'id' => 'inspection_' . $inspection->id,
                'type' => 'inspection',
                'message' => 'Inspection completed',
                'establishment' => $inspection->establishment->name,
                'time' => $inspection->updated_at->diffForHumans(),
                'status' => 'completed',
                'staff' => $inspection->staff->user->name ?? 'System'
            ]);
        }
        
        // Recent establishments registered
        $recentEstablishments = Establishment::orderBy('created_at', 'desc')
            ->limit(3)
            ->get();
            
        foreach ($recentEstablishments as $establishment) {
            $activities->push([
                'id' => 'establishment_' . $establishment->id,
                'type' => 'establishment',
                'message' => 'New establishment registered',
                'establishment' => $establishment->name,
                'time' => $establishment->created_at->diffForHumans(),
                'status' => 'registered'
            ]);
        }
        
        // Recent staff accounts created
        $recentStaff = Staff::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(2)
            ->get();
            
        foreach ($recentStaff as $staff) {
            $activities->push([
                'id' => 'staff_' . $staff->id,
                'type' => 'staff',
                'message' => 'Staff account created',
                'establishment' => $staff->user->name,
                'time' => $staff->created_at->diffForHumans(),
                'status' => 'created'
            ]);
        }
        
        return $activities->sortByDesc('time')->values()->take(8);
    }
    
    /**
     * Get upcoming inspections.
     */
    private function getUpcomingInspections()
    {
        return Inspection::where('inspection_timestamp', '>=', now())
            ->orderBy('inspection_timestamp', 'asc')
            ->limit(5)
            ->get()
            ->map(function ($inspection) {
                return [
                    'id' => $inspection->id,
                    'establishment' => 'Scheduled Inspection',
                    'date' => $inspection->inspection_timestamp->format('F j Y'), // February 5 2026
                    'time' => $inspection->inspection_timestamp->format('h:i A'),
                    'inspector' => 'To be scheduled',
                    'type' => $inspection->quarter ?? 'routine'
                ];
            });
    }
}
