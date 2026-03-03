<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Mark all notifications as read for current staff
     */
    public function markAllAsRead()
    {
        $user = auth()->user();
        
        // Mark all global notifications as read
        Notification::where('is_read', false)->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
        
        return back()->with('success', 'All notifications marked as read');
    }
    
    /**
     * Mark a specific notification as read
     */
    public function markAsRead($id)
    {
        $notification = Notification::findOrFail($id);
        $notification->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
        
        return back()->with('success', 'Notification marked as read');
    }
    
    /**
     * Clear old notifications (older than 7 days)
     */
    public function clearOld()
    {
        // Delete notifications older than 7 days
        $deleted = Notification::where('created_at', '<', now()->subDays(7))->delete();
        
        return back()->with('success', "Cleared {$deleted} old notifications");
    }
    
    /**
     * Get notification count for AJAX requests
     */
    public function getCount()
    {
        $count = Notification::where('is_read', false)->count();
        
        return response()->json(['count' => $count]);
    }
}
