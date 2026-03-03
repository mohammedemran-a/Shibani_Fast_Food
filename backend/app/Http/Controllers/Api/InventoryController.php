<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    /**
     * عرض قائمة بجميع أصناف المخزون.
     */
    public function index(Request $request)
    {
        $items = InventoryItem::query()
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy('name')
            ->get();

        // إعادة تسمية الحقول لتطابق الواجهة الأمامية
        $formattedItems = $items->map(function ($item) {
            return [
                'id' => $item->id,
                'name' => $item->name,
                'category' => $item->category,
                'unit' => $item->unit,
                'currentQty' => $item->current_quantity,
                'minQty' => $item->min_quantity,
                'costPerUnit' => $item->average_cost_per_unit,
            ];
        });

        return response()->json($formattedItems);
    }
}
