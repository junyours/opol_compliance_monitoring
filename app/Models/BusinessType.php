<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BusinessType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    public function establishments()
    {
        return $this->hasMany(Establishment::class, 'type_of_business_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
