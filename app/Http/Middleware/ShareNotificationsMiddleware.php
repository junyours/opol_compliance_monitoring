<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Staff;
use App\Services\NotificationService;

class ShareNotificationsMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only share notifications for authenticated staff users
        if (auth()->check()) {
            $user = auth()->user();
            $staff = Staff::where('user_id', $user->id)->first();
            
            if ($staff) {
                $notifications = NotificationService::generateNotificationsForStaff($staff);
                view()->share('notifications', $notifications);
                
                // Also share with Inertia if it's an Inertia request
                if ($request->header('X-Inertia')) {
                    inertia()->share('notifications', $notifications);
                }
            }
        }
        
        return $next($request);
    }
}
