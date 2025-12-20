<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * نموذج عنصر فاتورة المبيعات
 * 
 * يمثل كل منتج في الفاتورة مع تفاصيله (الكمية، السعر، الإجمالي)
 */
class SalesInvoiceItem extends Model
{
    use HasFactory;

    /**
     * الحقول القابلة للتعبئة
     * 
     * @var array
     */
    protected $fillable = [
        'sales_invoice_id',  // معرف الفاتورة التي ينتمي إليها العنصر
        'product_id',        // معرف المنتج
        'quantity',          // الكمية المباعة
        'unit_price',        // سعر الوحدة وقت البيع
        'total_price',       // السعر الإجمالي (الكمية × سعر الوحدة)
        'discount',          // الخصم على هذا العنصر (اختياري)
        'notes',             // ملاحظات إضافية على العنصر (اختياري)
    ];

    /**
     * تحويل أنواع البيانات
     * 
     * @var array
     */
    protected $casts = [
        'quantity' => 'integer',        // تحويل الكمية إلى رقم صحيح
        'unit_price' => 'decimal:2',    // تحويل سعر الوحدة إلى رقم عشري بمنزلتين
        'total_price' => 'decimal:2',   // تحويل السعر الإجمالي إلى رقم عشري بمنزلتين
        'discount' => 'decimal:2',      // تحويل الخصم إلى رقم عشري بمنزلتين
    ];

    /**
     * العلاقة مع الفاتورة
     * 
     * كل عنصر ينتمي إلى فاتورة واحدة
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function salesInvoice()
    {
        return $this->belongsTo(SalesInvoice::class);
    }

    /**
     * العلاقة مع المنتج
     * 
     * كل عنصر يمثل منتج واحد
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * حساب السعر الإجمالي بعد الخصم
     * 
     * @return float
     */
    public function getTotalAfterDiscountAttribute()
    {
        return $this->total_price - ($this->discount ?? 0);
    }

    /**
     * الحصول على اسم المنتج
     * 
     * @return string
     */
    public function getProductNameAttribute()
    {
        return $this->product ? $this->product->name : 'منتج محذوف';
    }
}
