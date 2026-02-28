<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // ✅ الحل الجذري: الحصول على ID المنتج الحالي من المسار (Route)
        $productId = $this->route('product')->id;

        return [
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'product_type' => 'required|in:Standard,Weighted',
            'description' => 'nullable|string',
            // ✅ القاعدة الذكية: تأكد من أن الـ SKU فريد، ولكن تجاهل المنتج الحالي
            'sku' => ['nullable', 'string', 'max:100', Rule::unique('products')->ignore($productId)],
            'reorder_level' => 'nullable|numeric|min:0',
            'is_active' => 'required|boolean',

            // التحقق من الوحدة الأساسية
            'base_unit' => 'required|array',
            'base_unit.name' => 'required|string|max:255',
            'base_unit.barcode' => ['nullable', 'string', 'max:255'], // ✅ تبسيط القاعدة
            'base_selling_price' => 'required|numeric|min:0',

            // التحقق من الوحدات الإضافية
            'additional_units' => 'nullable|array',
            'additional_units.*.id' => 'nullable|integer|exists:product_barcodes,id',
            'additional_units.*.name' => 'required|string|max:255',
            'additional_units.*.conversion_factor' => 'required|numeric|gt:0',
            'additional_units.*.barcode' => ['nullable', 'string', 'max:255'], // ✅ تبسيط القاعدة
            'additional_units.*.selling_price' => 'nullable|numeric|min:0',
        ];
    }
}
