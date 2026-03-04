<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseInvoiceItem extends Model
{
    use HasFactory;

    /**
     * ✅ [تصحيح] الحقول القابلة للتعبئة لتستخدم `product_id`
     */
    protected $fillable = [
        'purchase_invoice_id',
        'product_id', // ✅ التغيير هنا
        'quantity',
        'unit_price',
        'total_price',
        'notes',
        'expiry_date', // إضافة تاريخ الصلاحية
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
        'expiry_date' => 'date',
    ];

    public function purchaseInvoice()
    {
        return $this->belongsTo(PurchaseInvoice::class);
    }

    /**
     * ✅ [تصحيح] العلاقة مع موديل `Product`
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
