<?php

namespace App\Http\Controllers\Api\Product;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class StoreProductController extends Controller
{
    public function __invoke(Request $request)
    {
        // 1. قواعد تحقق مُحسَّنة تشمل الصورة
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'type' => ['required', Rule::in(['Sellable', 'RawMaterial'])],
            'category_id' => 'required|exists:categories,id',
            'is_active' => 'required|boolean',
            'price' => 'required_if:type,Sellable|numeric|min:0',
            'cost' => 'required_if:type,RawMaterial|numeric|min:0',
            'stock' => 'required_if:type,RawMaterial|numeric|min:0',
            'unit' => 'required_if:type,RawMaterial|string|max:50',
            'ingredients' => 'nullable|array',
            'ingredients.*.id' => 'required_with:ingredients|exists:products,id',
            'ingredients.*.quantity' => 'required_with:ingredients|numeric|min:0.001',
            // ✅ التحقق من الصورة: اختياري، يجب أن يكون صورة، الأنواع المسموح بها، والحجم الأقصى 10MB
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:10240',
        ]);

        // 2. تحويل is_active بشكل صريح
        $validatedData['is_active'] = filter_var($validatedData['is_active'], FILTER_VALIDATE_BOOLEAN);

        // 3. معالجة رفع الصورة إن وجدت
        if ($request->hasFile('image')) {
            // تخزين الصورة في public/products وتعيين المسار
            $path = $request->file('image')->store('products', 'public');
            $validatedData['image'] = $path;
        }

        // 4. إنشاء المنتج بالبيانات الأساسية
        $productData = collect($validatedData)->except(['ingredients', 'image'])->toArray();
        $productData['image'] = $validatedData['image'] ?? null; // إضافة مسار الصورة
        $product = Product::create($productData);

        // 5. ربط المكونات إن وجدت
        if ($product->type === 'Sellable' && !empty($validatedData['ingredients'])) {
            $ingredients = collect($validatedData['ingredients'])->mapWithKeys(function ($ingredient) {
                return [$ingredient['id'] => ['quantity' => $ingredient['quantity']]];
            });
            $product->ingredients()->sync($ingredients);
        }
        
        // 6. إرجاع المنتج الجديد مع تحميل العلاقات
        return new ProductResource($product->load(['category', 'ingredients']));
    }
}
