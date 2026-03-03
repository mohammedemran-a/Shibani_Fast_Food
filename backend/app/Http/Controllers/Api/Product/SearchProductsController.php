<?php

namespace App\Http\Controllers\Api\Product;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SearchProductsController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * يبحث عن المنتجات (خاصة المواد الخام) لإضافتها إلى الوصفات.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $request->validate([
            'query' => 'required|string|min:2',
            'type' => 'sometimes|in:Sellable,RawMaterial',
            'limit' => 'sometimes|integer|min:1|max:50',
        ]);

        $query = Product::query();

        // فلترة حسب الاسم
        $query->where('name', 'like', '%' . $request->query('query') . '%');

        // فلترة حسب النوع (إذا تم تحديده)
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // تحديد عدد النتائج
        $limit = $request->input('limit', 15);
        $products = $query->take($limit)->get(['id', 'name', 'unit']); // جلب الحقول المطلوبة فقط

        return response()->json($products);
    }
}
