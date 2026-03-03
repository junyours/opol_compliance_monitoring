<?php

namespace App\Observers;

use App\Models\Inspection;
use App\Services\NotificationService;

class InspectionObserver
{
    /**
     * Handle the Inspection "created" event.
     */
    public function created(Inspection $inspection): void
    {
        // Auto-create notification for assigned staff
        NotificationService::notifyNewInspection($inspection);
    }

    /**
     * Handle the Inspection "updated" event.
     */
    public function updated(Inspection $inspection): void
    {
        // If inspection timestamp is updated, create notification
        if ($inspection->wasChanged('inspection_timestamp')) {
            NotificationService::notifyNewInspection($inspection);
        }
    }
}
