<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Currency extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'symbol',
        'exchange_rate',
        'is_default',
    ];

    protected $casts = [
        'exchange_rate' => 'decimal:4',
        'is_default' => 'boolean',
    ];
}
