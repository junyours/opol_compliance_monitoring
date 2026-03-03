<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StaffSignature extends Model
{
    use HasFactory;

    protected $fillable = [
        'staff_id',
        'signature',
        'signature_type',
    ];

    protected $casts = [
        'signature' => 'string',
    ];

    public function staff()
    {
        return $this->belongsTo(\App\Models\User::class, 'staff_id');
    }
}
