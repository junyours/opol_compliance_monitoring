<?php

namespace App\Models;

use App\Models\InspectionCategory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ChecklistQuestion extends Model
{
    use HasFactory;

    protected $fillable = ['category_id', 'question', 'type', 'options', 'is_conditional', 'conditional_logic'];

protected $casts = [
    'options' => 'array',
    'conditional_logic' => 'json',
    'is_conditional' => 'boolean',
];


    // Relationship to category
    public function category()
    {
        return $this->belongsTo(InspectionCategory::class, 'category_id');
    }

    // Relationship to category (alias for consistency)
    public function inspectionCategory()
    {
        return $this->belongsTo(InspectionCategory::class, 'category_id');
    }
}
