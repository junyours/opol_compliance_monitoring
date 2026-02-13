<?php

namespace App\Models;

use App\Models\ChecklistQuestion;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class InspectionCategory extends Model
{
    use HasFactory;

    protected $fillable = ['name'];


     public function questions()
    {
    return $this->hasMany(ChecklistQuestion::class, 'category_id');
    }
}

