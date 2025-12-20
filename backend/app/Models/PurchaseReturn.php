<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * نموذج مرتجعات المشتريات
 * 
 * يمثل المنتجات المرتجعة للموردين من فواتير الشراء
 */
class PurchaseReturn extends Model
{
    use HasFactory;

    /**
     * الحقول القابلة للتعبئة
     * 
     * @var array
     */
    protected $fillable = [
        'return_number',         // رقم المرتجع (تلقائي: RET-YYYYMMDD-XXXX)
        'purchase_invoice_id',   // معرف فاتورة الشراء الأصلية
        'product_id',            // معرف المنتج المرتجع
        'quantity',              // الكمية المرتجعة
        'unit_price',            // سعر الوحدة (من الفاتورة الأصلية)
        'total_price',           // السعر الإجمالي للمرتجع
        'reason',                // سبب الإرجاع
        'return_date',           // تاريخ الإرجاع
        'status',                // حالة المرتجع (pending, approved, rejected)
        'notes',                 // ملاحظات إضافية
        'created_by',            // معرف المستخدم الذي أنشأ المرتجع
    ];

    /**
     * تحويل أنواع البيانات
     * 
     * @var array
     */
    protected $casts = [
        'return_date' => 'date',        // تحويل تاريخ الإرجاع إلى كائن تاريخ
        'quantity' => 'integer',        // تحويل الكمية إلى رقم صحيح
        'unit_price' => 'decimal:2',    // تحويل سعر الوحدة إلى رقم عشري بمنزلتين
        'total_price' => 'decimal:2',   // تحويل السعر الإجمالي إلى رقم عشري بمنزلتين
    ];

    /**
     * العلاقة مع فاتورة الشراء
     * 
     * كل مرتجع ينتمي إلى فاتورة شراء واحدة
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function purchaseInvoice()
    {
        return $this->belongsTo(PurchaseInvoice::class);
    }

    /**
     * العلاقة مع المنتج
     * 
     * كل مرتجع يمثل منتج واحد
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * العلاقة مع المستخدم المنشئ
     * 
     * كل مرتجع ينتمي إلى مستخدم واحد (الذي أنشأه)
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope للمرتجعات المعتمدة
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope للمرتجعات المعلقة
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope للمرتجعات المرفوضة
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
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

    /**
     * الحصول على رقم فاتورة الشراء
     * 
     * @return string
     */
    public function getInvoiceNumberAttribute()
    {
        return $this->purchaseInvoice ? $this->purchaseInvoice->invoice_number : 'N/A';
    }
}
