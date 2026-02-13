<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class IsStaff
{
    public function handle(Request $request, Closure $next)
    {
        // Check if user is logged in AND role is staff
        if (auth()->check() && auth()->user()->role === 'staff') {
            return $next($request);
        }

        // Otherwise block access
        abort(403, 'Unauthorized');
    }
}
