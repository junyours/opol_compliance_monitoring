<?php

namespace App\Services;

use App\Models\Staff;
use App\Models\Inspection;
use App\Models\InspectionResult;
use App\Models\Notification;
use Carbon\Carbon;

class NotificationService
{
    /**
     * Generate notifications for staff based on inspections and global notifications
     */
    public static function generateNotificationsForStaff(Staff $staff)
    {
        $notifications = [];
        
        // Get global notifications (for all staff) - only unread
        $globalNotifications = Notification::unread()
            ->latest()
            ->take(10)
            ->get();
        
        foreach ($globalNotifications as $notification) {
            $notifications[] = [
                'id' => $notification->id,
                'type' => $notification->type,
                'title' => $notification->title,
                'message' => $notification->message,
                'time' => $notification->time_ago,
                'inspection_id' => $notification->inspection_id,
            ];
        }
        
        // Get inspections assigned to this staff through InspectionResult
        $staffInspectionIds = InspectionResult::where('staff_id', $staff->id)
            ->pluck('inspection_id');
        
        if ($staffInspectionIds->isNotEmpty()) {
            // Get new inspections (created in last 24 hours)
            $newInspections = Inspection::whereIn('id', $staffInspectionIds)
                ->where('created_at', '>=', now()->subHours(24))
                ->orderBy('created_at', 'desc')
                ->get();
            
            foreach ($newInspections as $inspection) {
                // Skip if already in global notifications
                if (!collect($notifications)->where('inspection_id', $inspection->id)->first()) {
                    $notifications[] = [
                        'id' => 'new_' . $inspection->id,
                        'type' => 'new_inspection',
                        'title' => 'New Inspection Assigned',
                        'message' => "{$inspection->quarter} inspection scheduled for " . $inspection->inspection_timestamp->format('M d, Y \a\t h:i A'),
                        'time' => $inspection->created_at->diffForHumans(),
                        'inspection_id' => $inspection->id,
                    ];
                }
            }
            
            // Get upcoming inspections (next 48 hours)
            $upcomingInspections = Inspection::whereIn('id', $staffInspectionIds)
                ->where('inspection_timestamp', '>=', now())
                ->where('inspection_timestamp', '<=', now()->addHours(48))
                ->orderBy('inspection_timestamp', 'asc')
                ->get();
            
            foreach ($upcomingInspections as $inspection) {
                // Skip if already added
                if (!collect($notifications)->where('inspection_id', $inspection->id)->first()) {
                    $timeUntil = $inspection->inspection_timestamp->diffForHumans(now(), true);
                    $notifications[] = [
                        'id' => 'upcoming_' . $inspection->id,
                        'type' => 'upcoming_inspection',
                        'title' => 'Upcoming Inspection',
                        'message' => "{$inspection->quarter} inspection in {$timeUntil}",
                        'time' => $inspection->inspection_timestamp->diffForHumans(),
                        'inspection_id' => $inspection->id,
                    ];
                }
            }
            
            // Get today's inspections
            $todayInspections = Inspection::whereIn('id', $staffInspectionIds)
                ->whereDate('inspection_timestamp', today())
                ->orderBy('inspection_timestamp', 'asc')
                ->get();
            
            foreach ($todayInspections as $inspection) {
                // Skip if already added
                if (!collect($notifications)->where('inspection_id', $inspection->id)->first()) {
                    $notifications[] = [
                        'id' => 'today_' . $inspection->id,
                        'type' => 'today_inspection',
                        'title' => "Today's Inspection",
                        'message' => "{$inspection->quarter} inspection today at " . $inspection->inspection_timestamp->format('h:i A'),
                        'time' => $inspection->inspection_timestamp->diffForHumans(),
                        'inspection_id' => $inspection->id,
                    ];
                }
            }
        }
        
        // Sort notifications by time (most recent first)
        usort($notifications, function ($a, $b) {
            return strtotime($b['time']) - strtotime($a['time']);
        });
        
        return [
            'items' => array_slice($notifications, 0, 10), // Limit to 10 most recent
            'unreadCount' => count($notifications),
        ];
    }
    
    /**
     * Create global notification record in database (for all staff)
     */
    public static function createGlobalNotification($title, $message, $type = 'inspection', $inspectionId = null)
    {
        return Notification::create([
            'inspection_id' => $inspectionId,
            'title' => $title,
            'message' => $message,
            'type' => $type,
        ]);
    }
    
    /**
     * Auto-generate notifications for new inspection (global notification)
     */
    public static function notifyNewInspection(Inspection $inspection)
    {
        self::createGlobalNotification(
            'New Inspection Created',
            "A new {$inspection->quarter} inspection has been scheduled for " . $inspection->inspection_timestamp->format('M d, Y \a\t h:i A'),
            'new_inspection',
            $inspection->id
        );
    }
}
