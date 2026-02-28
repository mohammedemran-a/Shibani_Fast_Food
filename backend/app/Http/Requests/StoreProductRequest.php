<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule; // **مهم: استيراد Rule**

class StoreProductRequest extends FormRequest
{
    /**
     * تحديد ما إذا كان المستخدم مخولاً لإجراء هذا الطلب.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * تحضير البيانات للتحقق من صحتها.
     */
    protected function prepareForValidation()
    {
        if ($this->has('is_active')) {
            $this->merge([
                'is_active' => filter_var($this->is_active, FILTER_VALIDATE_BOOLEAN)
            ]);
        }
    }

    /**
     * الحصول على قواعد التحقق التي تنطبق على الطلب.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // --- القسم الأول: الهوية الأساسية ---
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'product_type' => 'required|in:Standard,Weighted',
            'description' => 'nullable|string',
            'sku' => 'nullable|string|unique:products,sku',
            'reorder_level' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
            
            // **تعديل هنا:** زيادة الحد الأقصى لحجم الصورة إلى 10 ميغابايت
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240',

            // --- الوحدة الأساسية ---
            'base_unit' => 'required|array',
            'base_unit.name' => 'required|string|max:255',
            
            // **تعديل هنا:** إضافة قاعدة التحقق من تفرد الباركود
            'base_unit.barcode' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('product_barcodes', 'barcode')
            ],

            // --- القسم الثاني: الوحدات الإضافية ---
            'additional_units' => 'nullable|array',
            'additional_units.*.name' => 'required_with:additional_units|string|max:255',
            'additional_units.*.conversion_factor' => 'required_with:additional_units|numeric|gt:0',
            
            // **تعديل هنا:** إضافة قاعدة التحقق من تفرد الباركود للوحدات الإضافية
            'additional_units.*.barcode' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('product_barcodes', 'barcode'),
                'distinct' // يضمن عدم تكرار الباركود داخل نفس الطلب
            ],
            'additional_units.*.selling_price' => 'nullable|numeric|min:0',

            // --- القسم الثالث: الدفعة الأولية (اختياري) ---
            'initial_batch' => 'nullable|array',
            'initial_batch.quantity' => 'required_with:initial_batch|numeric|min:0',
            'initial_batch.cost_price' => 'required_with:initial_batch|numeric|min:0',
            'initial_batch.expiry_date' => 'nullable|date',
            
            // --- القسم الرابع: التسعير ---
            'base_selling_price' => 'required|numeric|min:0',
        ];
    }
}
