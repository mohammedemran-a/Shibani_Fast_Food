<?php

namespace App\Http\Controllers\Api\Product;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SearchProductsController extends Controller
{
    /**
     * يبحث عن المنتجات بناءً على الاسم والنوع.
     *
     * @param Request $request
     * @return AnonymousResourceCollection
     */
    public function __invoke(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'type' => 'nullable|in:Sellable,RawMaterial',
        ]);

        // 1. نبدأ الاستعلام الأساسي
        $query = Product::query();

        // 2. ✅✅✅ هذا هو الإصلاح الجذري والنهائي ✅✅✅
        // إذا تم تحديد نوع المنتج في الطلب، نجعله شرطًا أساسيًا لا يمكن تجاوزه.
        if ($request->filled('type')) {
            $query->where('type', $validated['type']);
        }

        // 3. إذا تم إرسال اسم، ابحث به ضمن النتائج المفلترة (إن وجدت).
        if ($request->filled('name')) {
            $query->where('name', 'like', '%' . $validated['name'] . '%');
        } else {
            // إذا لم يكن هناك بحث، أعد أحدث 10 منتجات (مع احترام فلتر النوع إن وجد).
            $query->latest();
        }

        // 4. جلب النتائج
        $products = $query->take(10)->get();

        // 5. إرجاع النتائج من خلال الـ Resource
        return ProductResource::collection($products);
    }
}
