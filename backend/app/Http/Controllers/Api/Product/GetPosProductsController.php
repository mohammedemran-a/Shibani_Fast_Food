<?php

namespace App\Http\Controllers\Api\Product;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class GetPosProductsController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * يجلب المنتجات القابلة للبيع بتنسيق مناسب لشاشة نقطة البيع،
     * مجمعة حسب الفئات.
     */
    public function __invoke(): JsonResponse
    {
        // جلب جميع الفئات التي تحتوي على منتجات قابلة للبيع ونشطة
        $categories = Category::whereHas('products', function ($query) {
            $query->where('type', 'Sellable')->where('is_active', true);
        })
        ->with(['products' => function ($query) {
            // جلب المنتجات القابلة للبيع والنشطة فقط داخل كل فئة
            $query->where('type', 'Sellable')
                  ->where('is_active', true)
                  ->with('availableModifiers'); // جلب الإضافات المتاحة لكل منتج
        }])
        ->get();

        // إعادة هيكلة البيانات لتكون سهلة الاستخدام في الواجهة الأمامية
        $formattedData = $categories->map(function ($category) {
            return [
                'id' => $category->id,
                'name' => $category->name,
                'products' => $category->products->map(function ($product) {
                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'price' => $product->price,
                        'image' => $product->image, // رابط الصورة
                        'modifiers' => $product->availableModifiers->map(function ($modifier) {
                            return [
                                'id' => $modifier->id,
                                'name' => $modifier->name,
                                'price' => $modifier->price,
                            ];
                        }),
                    ];
                }),
            ];
        });

        return response()->json($formattedData);
    }
}
