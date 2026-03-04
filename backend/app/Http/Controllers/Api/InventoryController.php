<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product; // ✅ [تصحيح] استخدام موديل Product
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    /**
     * ✅ [تصحيح جذري] عرض قائمة المخزون من جدول المنتجات
     */
    public function index(Request $request)
    {
        $items = Product::query()
            // 1. جلب المواد الخام فقط
            ->where('type', 'RawMaterial')
            
            // 2. تطبيق البحث على اسم المادة الخام
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            
            ->orderBy('name')
            ->with('category') // ✅ جلب الفئة مع المنتج لتحسين الأداء
            ->get();

        // 3. إعادة تسمية الحقول لتطابق الواجهة الأمامية
        $formattedItems = $items->map(function ($item) {
            return [
                'id' => $item->id,
                'name' => $item->name,
                'category' => $item->category->name ?? 'غير محدد', // اسم الفئة
                'unit' => $item->unit,
                'currentQty' => (float) $item->stock, // ✅ استخدام حقل `stock`
                'minQty' => (float) $item->reorder_level,
                'costPerUnit' => (float) $item->cost,
            ];
        });

        return response()->json($formattedItems);
    }
}
