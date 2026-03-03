<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Penalty extends Model
{
    use HasFactory;

    protected $fillable = [
        'inspection_result_id',
        'penalty_type',
        'description',
        'status',
        'amount',
        'document_path',
        'document_name',
        'establishment_id',
        'inspection_id',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the inspection result that owns the penalty.
     */
    public function inspectionResult()
    {
        return $this->belongsTo(InspectionResult::class);
    }

    /**
     * Get the establishment that owns the penalty.
     */
    public function establishment()
    {
        return $this->belongsTo(Establishment::class);
    }

    /**
     * Get the inspection that owns the penalty.
     */
    public function inspection()
    {
        return $this->belongsTo(Inspection::class);
    }

    /**
     * Get the document URL attribute.
     */
    public function getDocumentUrlAttribute()
    {
        if ($this->document_path) {
            return asset('storage/' . $this->document_path);
        }
        return null;
    }
}
