<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * موديل عنصر فاتورة المبيعات (Sales Invoice Item Model)
 * 
 * يمثل كل منتج مباع داخل فاتورة معينة.
 * الأهم من ذلك، أنه يسجل "لقطة" من سعر التكلفة وسعر البيع في لحظة البيع،
 * مما يسمح بتحليل دقيق للأرباح حتى لو تغيرت أسعار المنتج لاحقًا.
 */
class SalesInvoiceItem extends Model
{
    use HasFactory;

    /**
     * الحقول القابلة للتعبئة بشكل جماعي (Mass Assignable).
     * تم تحديثها لتشمل `cost_price_per_unit` وهو الاسم المعتمد في قاعدة البيانات.
     *
     * @var array
     */
    protected $fillable = [
        'sales_invoice_id',
        'product_id',
        'quantity',
        'unit_price',           // سعر بيع الوحدة وقت البيع
        'cost_price_per_unit',  // **التعديل الرئيسي**: سعر تكلفة الوحدة وقت البيع (لتحليل الأرباح)
        'total_price',          // السعر الإجمالي (الكمية × سعر الوحدة)
        'discount',
        'notes',
    ];

    /**
     * تحويل أنواع البيانات (Casting).
     * يضمن التعامل الدقيق مع القيم الرقمية والعشرية.
     *
     * @var array
     */
    protected $casts = [
        'quantity' => 'decimal:2', // استخدام decimal ليدعم بيع أجزاء من الوحدة (مثل 1.5 كيلو)
        'unit_price' => 'decimal:2',
        'cost_price_per_unit' => 'decimal:2', // **التعديل الرئيسي**: إضافة تحويل النوع للحقل الجديد
        'total_price' => 'decimal:2',
        'discount' => 'decimal:2',
    ];

    /**
     * العلاقة مع الفاتورة الرئيسية (Many-to-One).
     */
    public function salesInvoice(): BelongsTo
    {
        return $this->belongsTo(SalesInvoice::class);
    }

    /**
     * العلاقة مع المنتج (Many-to-One).
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Accessor لحساب السعر الإجمالي بعد الخصم.
     *
     * @return float
     */
    public function getTotalAfterDiscountAttribute(): float
    {
        return $this->total_price - ($this->discount ?? 0);
    }

    /**
     * Accessor لحساب إجمالي الربح لهذا العنصر.
     * الربح = (سعر البيع - سعر التكلفة) * الكمية
     *
     * @return float
     */
    public function getProfitAttribute(): float
    {
        if (is_null($this->cost_price_per_unit)) {
            return 0;
        }
        
        $profitPerUnit = $this->unit_price - $this->cost_price_per_unit;
        return $profitPerUnit * $this->quantity;
    }
}
