<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    /**
     * تحديد ما إذا كان المستخدم مخولاً لإجراء هذا الطلب.
     */
    public function authorize(): bool
    {
        // افترض أن أي مستخدم مسجل دخوله يمكنه إنشاء منتج حاليًا
        return true;
    }

    /**
     * تحضير البيانات للتحقق من صحتها.
     * هذا هو المكان الذي نحل فيه مشكلة القيم المنطقية القادمة كنصوص.
     */
    protected function prepareForValidation()
    {
        // إذا كان حقل 'is_active' موجودًا في الطلب
        if ($this->has('is_active')) {
            // قم بدمج قيمة منطقية حقيقية في بيانات الطلب
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
            'is_active' => 'boolean', // الآن ستعمل بشكل صحيح بفضل prepareForValidation
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',

            // --- الوحدة الأساسية ---
            'base_unit' => 'required|array',
            'base_unit.name' => 'required|string|max:255',
            'base_unit.barcode' => 'nullable|string|max:255',

            // --- القسم الثاني: الوحدات الإضافية ---
            'additional_units' => 'nullable|array',
            'additional_units.*.name' => 'required_with:additional_units|string|max:255',
            'additional_units.*.conversion_factor' => 'required_with:additional_units|numeric|gt:0',
            'additional_units.*.barcode' => 'nullable|string|max:255',
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
