<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inspection extends Model
{
    use HasFactory;

    protected $fillable = [
        'quarter',
        'inspection_timestamp',
        'notes',
    ];

    protected $casts = [
        'inspection_timestamp' => 'datetime',
    ];

    /**
     * Get the inspection result associated with this inspection.
     */
    public function inspectionResult()
    {
        return $this->hasOne(InspectionResult::class);
    }

    /**
     * Get the establishment through the inspection result.
     */
    public function establishment()
    {
        return $this->hasOneThrough(Establishment::class, InspectionResult::class, 'inspection_id', 'id', 'id', 'establishment_id');
    }

    /**
     * Get the staff/inspector through the inspection result.
     */
    public function inspector()
    {
        return $this->hasOneThrough(Staff::class, InspectionResult::class, 'inspection_id', 'id', 'id', 'staff_id');
    }

    /**
     * Scope to get inspections with establishment and inspector info.
     */
    public function scopeWithDetails($query)
    {
        return $query->with(['inspectionResult.establishment', 'inspectionResult.staff']);
    }

    /**
     * Get formatted display for the inspection date and time.
     */
    public function getDisplayAttribute()
    {
        return $this->inspection_timestamp->format('M d, Y - h:i A');
    }

    /**
     * Get the date part of the inspection timestamp.
     */
    public function getDateAttribute()
    {
        return $this->inspection_timestamp->format('Y-m-d');
    }

    /**
     * Get the time part of the inspection timestamp.
     */
    public function getTimeAttribute()
    {
        return $this->inspection_timestamp->format('H:i');
    }
}
