<?php

namespace App\Http\Controllers\Api\Product;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class UpdateProductController extends Controller
{
    public function __invoke(Request $request, Product $product)
    {
        // 1. قواعد التحقق (نفس قواعد الإنشاء)
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
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:10240',
        ]);

        // 2. تحويل is_active بشكل صريح
        $validatedData['is_active'] = filter_var($validatedData['is_active'], FILTER_VALIDATE_BOOLEAN);

        // 3. معالجة الصورة الجديدة وحذف القديمة
        if ($request->hasFile('image')) {
            // حذف الصورة القديمة إذا كانت موجودة
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            // تخزين الصورة الجديدة
            $path = $request->file('image')->store('products', 'public');
            $validatedData['image'] = $path;
        }

        // 4. تحديث بيانات المنتج
        $productData = collect($validatedData)->except(['ingredients', 'image'])->toArray();
        if (isset($validatedData['image'])) {
            $productData['image'] = $validatedData['image'];
        }
        $product->update($productData);

        // 5. تحديث المكونات
        if ($product->type === 'Sellable') {
            if (!empty($validatedData['ingredients'])) {
                $ingredients = collect($validatedData['ingredients'])->mapWithKeys(function ($ingredient) {
                    return [$ingredient['id'] => ['quantity' => $ingredient['quantity']]];
                });
                $product->ingredients()->sync($ingredients);
            } else {
                // إذا تم إرسال مصفوفة فارغة، قم بإزالة كل المكونات
                $product->ingredients()->detach();
            }
        }
        
        // 6. إرجاع المنتج المحدث
        return new ProductResource($product->load(['category', 'ingredients']));
    }
}
