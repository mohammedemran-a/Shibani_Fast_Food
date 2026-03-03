<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'category',
        'unit',
        'current_quantity',
        'min_quantity',
        'average_cost_per_unit',
    ];

    protected $casts = [
        'current_quantity' => 'decimal:2',
        'min_quantity' => 'decimal:2',
        'average_cost_per_unit' => 'decimal:2',
    ];

    /**
     * علاقة الصنف بحركات المخزون الخاصة به.
     */
    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }
}
