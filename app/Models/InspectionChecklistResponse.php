<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InspectionChecklistResponse extends Model
{
    use HasFactory;

    protected $fillable = [
        'inspection_result_id',
        'checklist_question_id',
        'response',
        'notes',
        'remarks',
    ];

    /**
     * Get the inspection result that owns this response.
     */
    public function inspectionResult(): BelongsTo
    {
        return $this->belongsTo(InspectionResult::class);
    }

    /**
     * Get the checklist question for this response.
     */
    public function checklistQuestion(): BelongsTo
    {
        return $this->belongsTo(ChecklistQuestion::class);
    }

    /**
     * Check if the response is N/A.
     */
    public function isNotApplicable(): bool
    {
        return $this->response === 'N/A';
    }

    /**
     * Get the response display value.
     */
    public function getDisplayResponseAttribute(): string
    {
        return $this->isNotApplicable() ? 'N/A (Not Applicable)' : ($this->response ?? '');
    }

    /**
     * Check if the response is expired (has notes).
     */
    public function isExpired(): bool
    {
        return !empty($this->notes);
    }

    /**
     * Get the expiration status text.
     */
    public function getExpirationStatusAttribute(): string
    {
        return $this->isExpired() ? 'Expired' : 'Active';
    }
}
