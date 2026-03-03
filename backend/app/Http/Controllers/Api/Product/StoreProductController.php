<?php

namespace App\Http\Controllers\Api\Product;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class StoreProductController extends Controller
{
    public function __invoke(Request $request)
    {
        // ✅ 1. قواعد التحقق النهائية: تم تغيير قاعدة 'is_active' لتقبل النصوص
        $validatedData = $request->validate([
            'name' => 'required|string|max:255|unique:products,name',
            'type' => ['required', Rule::in(['Sellable', 'RawMaterial'])],
            'category_id' => 'required|exists:categories,id',
            // هذا هو الإصلاح الجذري: نقبل النصوص التي يرسلها FormData
            'is_active' => ['required', Rule::in(['true', 'false', '1', '0'])],
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:4048',
            'price' => 'required_if:type,Sellable|numeric|min:0',
            'unit' => 'required_if:type,RawMaterial|string|max:50',
            'ingredients' => 'nullable|array',
            'ingredients.*.id' => 'required_with:ingredients|exists:products,id,type,RawMaterial',
            'ingredients.*.quantity' => 'required_with:ingredients|numeric|min:0.001',
        ]);

        // ✅ 2. تحويل القيمة النصية إلى قيمة منطقية حقيقية
        $isActive = filter_var($validatedData['is_active'], FILTER_VALIDATE_BOOLEAN);

        $product = null;

        DB::transaction(function () use ($validatedData, $request, $isActive, &$product) {
            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('products', 'public');
            }

            // ✅ 3. إنشاء المنتج باستخدام القيمة المنطقية الصحيحة
            $product = Product::create([
                'name' => $validatedData['name'],
                'type' => $validatedData['type'],
                'category_id' => $validatedData['category_id'],
                'is_active' => $isActive, // نستخدم القيمة المحولة هنا
                'image' => $imagePath,
                'price' => $validatedData['price'] ?? null,
                'unit' => $validatedData['unit'] ?? null,
                'cost' => 0,
                'stock' => 0,
            ]);

            if ($product->type === 'Sellable' && !empty($validatedData['ingredients'])) {
                $ingredients = collect($validatedData['ingredients'])->mapWithKeys(function ($ingredient) {
                    return [$ingredient['id'] => ['quantity' => $ingredient['quantity']]];
                });
                $product->ingredients()->sync($ingredients);
            }
        });
        
        return new ProductResource($product->load(['category', 'ingredients']));
    }
}
