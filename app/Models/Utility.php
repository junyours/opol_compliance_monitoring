<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Utility extends Model
{
    use HasFactory;

    protected $fillable = [
        'form_name',
        'form_type',
        'columns',
        'rows',
        'description',
        'is_active'
    ];

    protected $casts = [
        'columns' => 'array',
        'rows' => 'array',
        'is_active' => 'boolean',
    ];
}
