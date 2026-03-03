<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Notification;

class ClearOldNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:clear-old-notifications';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clear notifications older than 7 days';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $deleted = Notification::where('created_at', '<', now()->subDays(7))->delete();
        
        $this->info("Cleared {$deleted} old notifications (older than 7 days)");
        
        return $deleted;
    }
}
