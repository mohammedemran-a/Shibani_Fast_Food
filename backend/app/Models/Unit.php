<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Unit extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'name_ar',
        'abbreviation',
        'parent_unit_id',
        'conversion_factor',
    ];

    protected $casts = [
        'conversion_factor' => 'float',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relations
    public function parentUnit()
    {
        return $this->belongsTo(Unit::class, 'parent_unit_id');
    }

    public function subUnits()
    {
        return $this->hasMany(Unit::class, 'parent_unit_id');
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
