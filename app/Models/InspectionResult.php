<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InspectionResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'inspection_id',
        'establishment_id',
        'staff_id',
        'other_remarks',
        'recommendations',
        'comply_lacking_permits',
        'provide_lacking_facilities',
        'others_recommendation',
        'status',
        'compliance_status',
        'automated_recommendations',
        'photos',
    ];

    protected $casts = [
        'comply_lacking_permits' => 'boolean',
        'provide_lacking_facilities' => 'boolean',
        'others_recommendation' => 'boolean',
        'automated_recommendations' => 'array',
        'photos' => 'array',
    ];

    /**
     * Get the inspection that owns this result.
     */
    public function inspection(): BelongsTo
    {
        return $this->belongsTo(Inspection::class);
    }

    /**
     * Get the establishment that was inspected.
     */
    public function establishment(): BelongsTo
    {
        return $this->belongsTo(Establishment::class);
    }

    /**
     * Get the staff who conducted the inspection.
     */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'staff_id');
    }

    /**
     * Get the checklist responses for this inspection result.
     */
    public function checklistResponses(): HasMany
    {
        return $this->hasMany(InspectionChecklistResponse::class);
    }

    /**
     * Get the utility data for this inspection result.
     */
    public function utilityData(): HasMany
    {
        return $this->hasMany(InspectionUtilityData::class);
    }

    /**
     * Get the conditional field responses for this inspection result.
     */
    public function conditionalFieldResponses(): HasMany
    {
        return $this->hasMany(ConditionalFieldResponse::class);
    }

    /**
     * Get the status badge color.
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'draft' => 'bg-gray-100 text-gray-800',
            'submitted' => 'bg-blue-100 text-blue-800',
            'reviewed' => 'bg-yellow-100 text-yellow-800',
            'approved' => 'bg-green-100 text-green-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }

    /**
     * Scope a query to only include inspections with a given status.
     */
    public function scopeStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to only include inspections by a staff member.
     */
    public function scopeByStaff($query, int $staffId)
    {
        return $query->where('staff_id', $staffId);
    }
}
