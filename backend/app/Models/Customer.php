<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'name_ar',
        'email',
        'phone',
        'address',
        'city',
        'country',
        'notes',
        'loyalty_points',
        'is_active',
    ];

    protected $casts = [
        'loyalty_points' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function salesInvoices()
    {
        return $this->hasMany(SalesInvoice::class);
    }

    public function debts()
    {
        return $this->hasMany(Debt::class);
    }
}
