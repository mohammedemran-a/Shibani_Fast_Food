<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * موديل يمثل الوحدات والباركودات المتعددة للمنتج الواحد.
 * 
 * هذا الموديل هو "ممثل" لجدول `product_barcodes` في الكود.
 */
class ProductBarcode extends Model
{
    use HasFactory;

    /**
     * الحقول التي يمكن إدخالها بشكل جماعي (Mass Assignable).
     * هذه هي الحقول التي نسمح بتعبئتها عند إنشاء أو تحديث سجل جديد.
     *
     * @var array
     */
    protected $fillable = [
        'product_id',
        'unit_name',      // اسم الوحدة (مثال: "كرتونة")
        'barcode',        // الباركود الخاص بهذه الوحدة
        'unit_quantity',  // كم قطعة من الوحدة الأساسية تحتويها هذه الوحدة (مثال: 12)
        'selling_price',  // سعر بيع هذه الوحدة تحديدًا (اختياري)
        'is_base_unit',   // ✅ الحل: إضافة هذا الحقل للسماح بحفظه
    ];

    /**
     * تحديد أنواع البيانات للحقول (Casting).
     * هذا يضمن أن Laravel يتعامل مع البيانات بشكل صحيح عند قراءتها وكتابتها.
     *
     * @var array
     */
    protected $casts = [
        'unit_quantity' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'is_base_unit'  => 'boolean', // يضمن تحويل 1/0 إلى true/false عند القراءة
    ];

    /**
     * علاقة: كل باركود ينتمي إلى منتج واحد (Many-to-One).
     * 
     * هذه الدالة تسمح لنا بالوصول إلى تفاصيل المنتج المرتبط بهذا الباركود
     * بسهولة، على سبيل المثال: $barcode->product->name
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
