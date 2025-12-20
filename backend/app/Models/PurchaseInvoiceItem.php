<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * نموذج عنصر فاتورة المشتريات
 * 
 * يمثل كل منتج في فاتورة الشراء مع تفاصيله (الكمية، السعر، الإجمالي)
 */
class PurchaseInvoiceItem extends Model
{
    use HasFactory;

    /**
     * الحقول القابلة للتعبئة
     * 
     * @var array
     */
    protected $fillable = [
        'purchase_invoice_id',  // معرف فاتورة الشراء
        'product_id',           // معرف المنتج
        'quantity',             // الكمية المشتراة
        'unit_price',           // سعر الوحدة وقت الشراء
        'total_price',          // السعر الإجمالي (الكمية × سعر الوحدة)
        'notes',                // ملاحظات إضافية على العنصر (اختياري)
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
    ];

    /**
     * الحقول المضافة تلقائياً للنموذج
     * 
     * @var array
     */
    protected $appends = ['returned_quantity', 'available_return_quantity', 'sold_quantity'];

    /**
     * العلاقة مع فاتورة الشراء
     * 
     * كل عنصر ينتمي إلى فاتورة شراء واحدة
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
     * كل عنصر يمثل منتج واحد
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * العلاقة مع المرتجعات
     * 
     * كل عنصر يمكن أن يكون له عدة مرتجعات
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function returns()
    {
        return $this->hasMany(PurchaseReturn::class, 'product_id', 'product_id')
                    ->where('purchase_invoice_id', $this->purchase_invoice_id);
    }

    /**
     * حساب الكمية المرتجعة من هذا العنصر
     * 
     * @return int
     */
    public function getReturnedQuantityAttribute()
    {
        return PurchaseReturn::where('purchase_invoice_id', $this->purchase_invoice_id)
                            ->where('product_id', $this->product_id)
                            ->sum('quantity');
    }

    /**
     * حساب الكمية المباعة من هذا المنتج بعد الشراء
     * 
     * يتم حساب الكمية المباعة من تاريخ الشراء إلى الآن
     * 
     * @return int
     */
    public function getSoldQuantityAttribute()
    {
        // الحصول على تاريخ الفاتورة
        $invoiceDate = $this->purchaseInvoice->invoice_date;
        
        // حساب الكمية المباعة من هذا المنتج بعد تاريخ الشراء
        return SalesInvoiceItem::where('product_id', $this->product_id)
            ->whereHas('salesInvoice', function($query) use ($invoiceDate) {
                $query->where('invoice_date', '>=', $invoiceDate);
            })
            ->sum('quantity');
    }

    /**
     * حساب الكمية المتاحة للإرجاع
     * 
     * الكمية المتاحة = الكمية الأصلية - الكمية المرتجعة - الكمية المباعة
     * 
     * @return int
     */
    public function getAvailableReturnQuantityAttribute()
    {
        $original = $this->quantity;
        $returned = $this->returned_quantity;
        $sold = $this->sold_quantity;
        
        return max(0, $original - $returned - $sold);
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
