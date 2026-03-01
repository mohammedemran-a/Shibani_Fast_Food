<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

/**
 * ===================================================================
 *  متحكم مخصص لعمليات البحث (Search Operations)
 * ===================================================================
 * 
 * هذا المتحكم مسؤول عن توفير نقاط نهاية (endpoints) مخصصة لعمليات البحث
 * في أجزاء مختلفة من النظام، مما يساعد على فصل مسؤولية البحث عن المتحكمات الرئيسية
 * والحفاظ على نظافة الكود وقابليته للتوسع.
 */
class SearchController extends Controller
{
    /**
     * ✅ ===================================================================
     * ✅  بحث مخصص عن المنتجات لشاشة "إضافة فاتورة شراء"
     * ✅ ===================================================================
     * 
     * هذه الدالة مصممة خصيصًا لتلبية متطلبات مربع البحث (Combobox) في شاشة المشتريات.
     * - تبحث فقط في المنتجات النشطة.
     * - تبحث بالاسم أو الـ SKU.
     * - تعيد دائمًا الوحدات (barcodes) المرتبطة بالمنتج.
     * - تحد من عدد النتائج لضمان الأداء العالي.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function searchProductsForPurchase(Request $request)
    {
        $request->validate([
            'query' => 'nullable|string|max:255',
            'limit' => 'nullable|integer|min:1|max:20'
        ]);

        $searchQuery = $request->input('query', '');
        $limit = $request->input('limit', 10);

        // نبدأ الاستعلام بالمنتجات النشطة فقط
        $query = Product::where('is_active', true);

        // نطبق فلتر البحث فقط إذا كان هناك نص للبحث
        if (!empty($searchQuery)) {
            $query->where(function ($q) use ($searchQuery) {
                $q->where('name', 'LIKE', "%{$searchQuery}%")
                  ->orWhere('sku', 'LIKE', "%{$searchQuery}%");
            });
        }

        // نحمل علاقة الوحدات (barcodes) ونجلب النتائج مع تحديد العدد الأقصى
        $products = $query->with([
                            'barcodes' => function ($query) {
                                // ترتيب الوحدات لجعل الوحدة الأساسية أولاً إن أمكن
                                $query->orderBy('is_base_unit', 'desc')->orderBy('unit_quantity', 'asc');
                            }
                        ])
                         ->take($limit)
                         ->get();

        // نرجع استجابة JSON مباشرة، الواجهة الأمامية ستتعامل معها
        return response()->json($products);
    }
}
