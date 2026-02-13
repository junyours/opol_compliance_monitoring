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
}
