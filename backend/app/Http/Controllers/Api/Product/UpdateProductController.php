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
        // ✅✅✅ هذا هو الإصلاح الجذري والنهائي ✅✅✅
        // 1. قواعد التحقق المحدثة (تم إزالة cost و stock)
        $validatedData = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            // لا يمكن تغيير النوع بعد الإنشاء، لذلك نستخدم 'sometimes'
            'type' => ['sometimes', 'required', Rule::in(['Sellable', 'RawMaterial'])],
            'category_id' => 'sometimes|required|exists:categories,id',
            // تم تغيير القاعدة لتقبل القيم النصية من FormData
            'is_active' => ['sometimes', 'required', Rule::in(['true', 'false', '1', '0'])],
            'price' => 'nullable|required_if:type,Sellable|numeric|min:0',
            'unit' => 'nullable|required_if:type,RawMaterial|string|max:50',
            'ingredients' => 'nullable|array',
            'ingredients.*.id' => 'required_with:ingredients|exists:products,id',
            'ingredients.*.quantity' => 'required_with:ingredients|numeric|min:0.001',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:10240',
        ]);

        // 2. تحويل is_active بشكل صريح إذا تم إرسالها
        if (isset($validatedData['is_active'])) {
            $validatedData['is_active'] = filter_var($validatedData['is_active'], FILTER_VALIDATE_BOOLEAN);
        }

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
        $product->update($validatedData);

        // 5. تحديث المكونات (فقط إذا تم إرسالها)
        if (isset($validatedData['ingredients']) && $product->type === 'Sellable') {
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
        
        // 6. إرجاع المنتج المحدث مع العلاقات
        return new ProductResource($product->load(['category', 'ingredients']));
    }
}
