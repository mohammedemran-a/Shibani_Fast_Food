<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    use HasFactory;

    protected $fillable = [
        'inventory_item_id',
        'type',
        'quantity',
        'cost_per_unit',
        'source_type',
        'source_id',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'cost_per_unit' => 'decimal:2',
    ];

    /**
     * علاقة الحركة بالصنف الذي تنتمي إليه.
     */
    public function inventoryItem()
    {
        return $this->belongsTo(InventoryItem::class);
    }
}
