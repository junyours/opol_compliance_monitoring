<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Establishment extends Model
{
    use HasFactory;

    // Fields that can be mass assigned
    protected $fillable = [
        'name',
        'proponent',
        'address',
        'contact_number',
        'email',
        'type_of_business_id',
        'Barangay',
        'total_capacity',
        'number_of_rooms',
        'number_of_employees',
        'status',
    ];

    /**
     * Get the inspection results for this establishment.
     */
    public function inspectionResults(): HasMany
    {
        return $this->hasMany(InspectionResult::class);
    }

    /**
     * Get the business type that owns the establishment.
     */
    public function businessType()
    {
        return $this->belongsTo(BusinessType::class, 'type_of_business_id');
    }
}
