<?php

namespace App\Http\Controllers\Api\Product;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Resources\ProductResource; // استيراد الـ Resource

class ListProductsController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * يجلب قائمة بكل المنتجات (وجبات ومواد خام) لصفحة الإدارة،
     * مع دعم الفلترة والـ Pagination والعلاقات الديناميكية.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $query = Product::query()->latest();

        // ===================================================================
        // ✅✅✅ الحل الجذري: التعامل مع العلاقات بشكل آمن وديناميكي ✅✅✅
        // ===================================================================

        // 1. تحديد العلاقات المسموح بتحميلها فقط
        $allowedRelations = ['category', 'ingredients'];

        if ($request->has('with')) {
            // 2. الحصول على العلاقات المطلوبة من الطلب
            $requestedRelations = explode(',', $request->input('with'));
            
            // 3. فلترة العلاقات المطلوبة لتشمل المسموح بها فقط
            $validRelations = array_intersect($allowedRelations, $requestedRelations);

            // 4. تحميل العلاقات الصالحة فقط إذا كانت موجودة
            if (!empty($validRelations)) {
                $query->with($validRelations);
            }
        } else {
            // كحل احتياطي، قم دائمًا بتحميل الفئة إذا لم يتم تحديد أي علاقات
            $query->with('category');
        }

        // ===================================================================

        // فلترة حسب النوع (وجبة أو مادة خام)
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // فلترة حسب الاسم
        if ($request->filled('name')) {
            $query->where('name', 'like', '%' . $request->name . '%');
        }

        $products = $query->paginate($request->input('per_page', 15));

        // استخدام ProductResource لتنسيق البيانات المرسلة إلى الواجهة الأمامية
        return ProductResource::collection($products)->response();
    }
}
