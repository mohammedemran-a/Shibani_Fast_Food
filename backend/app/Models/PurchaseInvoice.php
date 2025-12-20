<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * نموذج فاتورة المشتريات
 * 
 * يمثل فواتير الشراء من الموردين مع جميع التفاصيل المالية
 * والعلاقات مع الموردين وعناصر الفاتورة
 */
class PurchaseInvoice extends Model
{
    use HasFactory;

    /**
     * الحقول القابلة للتعبئة
     * 
     * @var array
     */
    protected $fillable = [
        'invoice_number',    // رقم الفاتورة (تلقائي: PUR-YYYYMMDD-XXXX)
        'supplier_id',       // معرف المورد
        'invoice_date',      // تاريخ الفاتورة
        'due_date',          // تاريخ الاستحقاق
        'subtotal',          // المجموع الفرعي (قبل الضريبة والخصم)
        'tax_amount',        // قيمة الضريبة
        'discount_amount',   // قيمة الخصم
        'total_amount',      // المجموع الإجمالي (بعد الضريبة والخصم)
        'paid_amount',       // المبلغ المدفوع
        'status',            // حالة الفاتورة (completed, pending, cancelled)
        'notes',             // ملاحظات إضافية
        'created_by',        // معرف المستخدم الذي أنشأ الفاتورة
    ];

    /**
     * تحويل أنواع البيانات
     * 
     * @var array
     */
    protected $casts = [
        'invoice_date' => 'date',           // تحويل تاريخ الفاتورة إلى كائن تاريخ
        'due_date' => 'date',               // تحويل تاريخ الاستحقاق إلى كائن تاريخ
        'subtotal' => 'decimal:2',          // تحويل المجموع الفرعي إلى رقم عشري بمنزلتين
        'tax_amount' => 'decimal:2',        // تحويل الضريبة إلى رقم عشري بمنزلتين
        'discount_amount' => 'decimal:2',   // تحويل الخصم إلى رقم عشري بمنزلتين
        'total_amount' => 'decimal:2',      // تحويل المجموع الإجمالي إلى رقم عشري بمنزلتين
        'paid_amount' => 'decimal:2',       // تحويل المبلغ المدفوع إلى رقم عشري بمنزلتين
    ];

    /**
     * الحقول المضافة تلقائياً للنموذج
     * 
     * @var array
     */
    protected $appends = ['remaining_amount', 'payment_status'];

    /**
     * العلاقة مع المورد
     * 
     * كل فاتورة شراء تنتمي إلى مورد واحد
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * العلاقة مع المستخدم المنشئ
     * 
     * كل فاتورة شراء تنتمي إلى مستخدم واحد (الذي أنشأها)
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * العلاقة مع عناصر الفاتورة
     * 
     * كل فاتورة شراء تحتوي على عدة عناصر (منتجات)
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function items()
    {
        return $this->hasMany(PurchaseInvoiceItem::class);
    }

    /**
     * العلاقة مع المرتجعات
     * 
     * كل فاتورة شراء يمكن أن يكون لها عدة مرتجعات
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function returns()
    {
        return $this->hasMany(PurchaseReturn::class);
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
     * حساب المبلغ المتبقي للدفع
     * 
     * @return float
     */
    public function getRemainingAmountAttribute()
    {
        return max(0, $this->total_amount - ($this->paid_amount ?? 0));
    }

    /**
     * حساب حالة الدفع
     * 
     * @return string
     */
    public function getPaymentStatusAttribute()
    {
        $paid = $this->paid_amount ?? 0;
        
        if ($paid >= $this->total_amount) {
            return 'paid';      // مدفوع بالكامل
        } elseif ($paid > 0) {
            return 'partial';   // مدفوع جزئياً
        } else {
            return 'unpaid';    // غير مدفوع
        }
    }

    /**
     * التحقق من أن الفاتورة مدفوعة بالكامل
     * 
     * @return bool
     */
    public function isFullyPaid()
    {
        return ($this->paid_amount ?? 0) >= $this->total_amount;
    }

    /**
     * حساب إجمالي الكميات المرتجعة لكل منتج
     * 
     * @param int $productId
     * @return int
     */
    public function getReturnedQuantity($productId)
    {
        return $this->returns()
            ->where('product_id', $productId)
            ->sum('quantity');
    }

    /**
     * حساب الكمية المتاحة للإرجاع لمنتج معين
     * 
     * @param int $productId
     * @return int
     */
    public function getAvailableReturnQuantity($productId)
    {
        // الكمية الأصلية في الفاتورة
        $originalQuantity = $this->items()
            ->where('product_id', $productId)
            ->sum('quantity');
        
        // الكمية المرتجعة
        $returnedQuantity = $this->getReturnedQuantity($productId);
        
        // الكمية المتاحة للإرجاع
        return max(0, $originalQuantity - $returnedQuantity);
    }
}
