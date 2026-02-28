<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductStockBatch extends Model
{
    use HasFactory;

    /**
     * الحقول التي يمكن إدخالها بشكل جماعي.
     *
     * @var array
     */
    protected $fillable = [
        'product_id',
        'purchase_invoice_item_id',
        'quantity_received',
        'quantity_remaining',
        'purchase_price_per_unit',
        'expiry_date',
    ];

    /**
     * تحديد أنواع البيانات للحقول لضمان التعامل الصحيح معها.
     *
     * @var array
     */
    protected $casts = [
        'quantity_received' => 'decimal:2',
        'quantity_remaining' => 'decimal:2',
        'purchase_price_per_unit' => 'decimal:4',
        'expiry_date' => 'date',
    ];

    /**
     * علاقة: كل دفعة مخزون تنتمي إلى منتج واحد.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * علاقة: كل دفعة مخزون قد تنتمي إلى عنصر فاتورة شراء واحد.
     */
    public function purchaseInvoiceItem(): BelongsTo
    {
        return $this->belongsTo(PurchaseInvoiceItem::class);
    }
}
