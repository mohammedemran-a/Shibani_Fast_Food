<?php

namespace App\Services;

use App\Models\InventoryItem;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;

class InventoryService
{
    /**
     * إضافة مخزون إلى صنف معين.
     * هذه هي الدالة التي سيتم استدعاؤها من متحكم المشتريات.
     *
     * @param int $itemId
     * @param float $quantity
     * @param float $costPerUnit
     * @param string|null $sourceType
     * @param int|null $sourceId
     * @param string|null $notes
     */
    public function addStock(int $itemId, float $quantity, float $costPerUnit, ?string $sourceType = null, ?int $sourceId = null, ?string $notes = null): void
    {
        DB::transaction(function () use ($itemId, $quantity, $costPerUnit, $sourceType, $sourceId, $notes) {
            $item = InventoryItem::findOrFail($itemId);

            // 1. تسجيل حركة الدخول
            StockMovement::create([
                'inventory_item_id' => $itemId,
                'type' => 'in',
                'quantity' => $quantity,
                'cost_per_unit' => $costPerUnit,
                'source_type' => $sourceType,
                'source_id' => $sourceId,
                'notes' => $notes,
            ]);

            // 2. تحديث الكمية الإجمالية ومتوسط التكلفة
            $newTotalQuantity = $item->current_quantity + $quantity;
            
            // حساب متوسط التكلفة المرجح
            $oldTotalCost = $item->current_quantity * $item->average_cost_per_unit;
            $newStockCost = $quantity * $costPerUnit;
            $newAverageCost = ($oldTotalCost + $newStockCost) / $newTotalQuantity;

            $item->update([
                'current_quantity' => $newTotalQuantity,
                'average_cost_per_unit' => $newAverageCost,
            ]);
        });
    }
}
