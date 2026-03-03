<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ConditionalFieldResponse extends Model
{
    use HasFactory;

    protected $fillable = [
        'inspection_result_id',
        'checklist_question_id',
        'field_name',
        'field_value'
    ];

    // Relationships
    public function inspectionResult()
    {
        return $this->belongsTo(InspectionResult::class);
    }

    public function checklistQuestion()
    {
        return $this->belongsTo(ChecklistQuestion::class);
    }

    /**
     * Get the inspection checklist response for this conditional field.
     */
    public function inspectionChecklistResponse()
    {
        return $this->hasOne(InspectionChecklistResponse::class, 'inspection_result_id', 'inspection_result_id')
            ->where('checklist_question_id', $this->checklist_question_id);
    }

    /**
     * Check if the conditional field is expired (has notes in the checklist response).
     */
    public function isExpired(): bool
    {
        $response = $this->inspectionChecklistResponse()->first();
        return $response ? !empty($response->notes) : false;
    }

    /**
     * Get the expiration status text.
     */
    public function getExpirationStatusAttribute(): string
    {
        return $this->isExpired() ? 'Expired' : 'Valid';
    }

    /**
     * Get the notes from the associated checklist response.
     */
    public function getNotesAttribute(): ?string
    {
        $response = $this->inspectionChecklistResponse()->first();
        return $response ? $response->notes : null;
    }
}
