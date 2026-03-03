<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * ✅ نموذج عنصر فاتورة المشتريات (النسخة النهائية والمحدثة)
 * 
 * يمثل كل صنف مخزون في فاتورة الشراء مع تفاصيله.
 */
class PurchaseInvoiceItem extends Model
{
    use HasFactory;

    /**
     * ✅ [تعديل] الحقول القابلة للتعبئة
     * 
     * @var array
     */
    protected $fillable = [
        'purchase_invoice_id',
        'inventory_item_id', // ✅ التغيير هنا
        'quantity',
        'unit_price',
        'total_price',
        'notes',
    ];

    /**
     * ✅ [تعديل] تحويل أنواع البيانات
     * 
     * @var array
     */
    protected $casts = [
        'quantity' => 'decimal:2', // ✅ من الأفضل أن يكون عشريًا ليدعم (1.5 كجم)
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
    ];

    /**
     * ✅ [حذف] تم حذف مصفوفة $appends لتحسين الأداء.
     * سيتم حساب هذه القيم عند الحاجة فقط.
     */
    // protected $appends = [...]; // <-- محذوف

    /**
     * العلاقة مع فاتورة الشراء
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function purchaseInvoice()
    {
        return $this->belongsTo(PurchaseInvoice::class);
    }

    /**
     * ✅ [تعديل] العلاقة مع صنف المخزون
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function inventoryItem()
    {
        return $this->belongsTo(InventoryItem::class);
    }

    /**
     * ✅ [حذف] تم حذف كل الدوال الملحقة (Accessors) المعقدة.
     * هذا المنطق يجب أن يكون في مكان آخر (مثل Services) إذا احتجناه،
     * وليس في النموذج نفسه لتحسين الأداء والحفاظ على فصل المسؤوليات.
     */
    // public function getReturnedQuantityAttribute() { ... } // <-- محذوف
    // public function getSoldQuantityAttribute() { ... } // <-- محذوف
    // public function getAvailableReturnQuantityAttribute() { ... } // <-- محذوف
    // public function getProductNameAttribute() { ... } // <-- محذوف
}
