<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Inspection;
use App\Observers\InspectionObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Inspection::observe(InspectionObserver::class);
    }
}
