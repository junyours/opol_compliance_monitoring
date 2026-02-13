<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (!auth()->user() || auth()->user()->role !== $role) {
            // Redirect based on user's actual role
            if (auth()->user()) {
                if (auth()->user()->role === 'admin') {
                    return redirect('/admin/dashboard');
                } elseif (auth()->user()->role === 'staff') {
                    return redirect('/staff/dashboard');
                }
            }
            return redirect('/');
        }

        return $next($request);
    }
}
