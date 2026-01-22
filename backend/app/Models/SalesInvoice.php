<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * نموذج فاتورة المبيعات
 * 
 * يمثل فواتير البيع في النظام مع جميع التفاصيل المالية
 * والعلاقات مع العملاء والكاشير وعناصر الفاتورة
 */
class SalesInvoice extends Model
{
    use HasFactory;

    /**
     * الحقول القابلة للتعبئة
     * 
     * @var array
     */
    protected $fillable = [
        'invoice_number',    // رقم الفاتورة (تلقائي: INV-YYYYMMDD-XXXX)
        'customer_id',       // معرف العميل (اختياري - للعملاء المسجلين)
        'cashier_id',        // معرف الكاشير (المستخدم الذي أجرى البيع)
        'invoice_date',      // تاريخ الفاتورة
        'subtotal',          // المجموع الفرعي (قبل الضريبة والخصم)
        'tax_amount',        // قيمة الضريبة
        'discount_amount',   // قيمة الخصم
        'total_amount',      // المجموع الإجمالي (بعد الضريبة والخصم)
        'payment_method',    // طريقة الدفع (cash, wallet, debt)
        'wallet_name',       // اسم المحفظة الإلكترونية (إذا كانت طريقة الدفع wallet)
        'transaction_code',  // رمز المعاملة (للمحافظ الإلكترونية)
        'status',            // حالة الفاتورة (completed, pending, cancelled)
        'notes',             // ملاحظات إضافية
    ];

    /**
     * تحويل أنواع البيانات
     * 
     * @var array
     */
    protected $casts = [
        'invoice_date' => 'date',           // تحويل تاريخ الفاتورة إلى كائن تاريخ
        'subtotal' => 'decimal:2',          // تحويل المجموع الفرعي إلى رقم عشري بمنزلتين
        'tax_amount' => 'decimal:2',        // تحويل الضريبة إلى رقم عشري بمنزلتين
        'discount_amount' => 'decimal:2',   // تحويل الخصم إلى رقم عشري بمنزلتين
        'total_amount' => 'decimal:2',      // تحويل المجموع الإجمالي إلى رقم عشري بمنزلتين
    ];
    /**
     * // ** إضافة: العلاقة مع الدين **
     * // الفاتورة قد يكون لها سجل دين واحد مرتبط بها
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function debt()
    {
        return $this->hasOne(\App\Models\Debt::class);
    }

    /**
     * العلاقة مع العميل
     * 
     * كل فاتورة تنتمي إلى عميل واحد (اختياري)
     * إذا كان null فهو عميل عابر (Walk-in Customer)
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * العلاقة مع الكاشير (المستخدم)
     * 
     * كل فاتورة تنتمي إلى كاشير واحد (المستخدم الذي أجرى البيع)
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function cashier()
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    /**
     * العلاقة مع عناصر الفاتورة
     * 
     * كل فاتورة تحتوي على عدة عناصر (منتجات)
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function items()
    {
        return $this->hasMany(SalesInvoiceItem::class);
    }

    /**
     * Scope للفواتير المكتملة
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope للفواتير المعلقة
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope للفواتير الملغاة
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    /**
     * Scope للفواتير في فترة زمنية محددة
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $from
     * @param string $to
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeDateRange($query, $from, $to)
    {
        return $query->whereBetween('invoice_date', [$from, $to]);
    }

    /**
     * حساب إجمالي عدد المنتجات في الفاتورة
     * 
     * @return int
     */
    public function getTotalItemsAttribute()
    {
        return $this->items->sum('quantity');
    }

    /**
     * الحصول على اسم العميل أو "عميل عابر"
     * 
     * @return string
     */
    public function getCustomerNameAttribute()
    {
        return $this->customer ? $this->customer->name : 'عميل عابر';
    }
}
