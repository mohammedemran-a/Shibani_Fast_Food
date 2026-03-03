<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
// لا نحتاج إلى استيراد PurchaseReturn و PurchaseReturnItem هنا

class PurchaseInvoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'supplier_id',
        'invoice_date',
        'due_date',
        'subtotal',
        'tax_amount',
        'discount_amount',
        'total_amount',
        'paid_amount',
        'status',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'invoice_date' => 'date',
        'due_date' => 'date',
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
    ];

    protected $appends = ['remaining_amount', 'payment_status'];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items()
    {
        return $this->hasMany(PurchaseInvoiceItem::class);
    }

    public function returns()
    {
        return $this->hasMany(PurchaseReturn::class, 'purchase_invoice_id');
    }

    // ... (بقية الدوال scope... و isFullyPaid... تبقى كما هي) ...
    public function scopeCompleted($query) { return $query->where('status', 'completed'); }
    public function scopePending($query) { return $query->where('status', 'pending'); }
    public function scopeCancelled($query) { return $query->where('status', 'cancelled'); }
    public function getRemainingAmountAttribute() { return max(0, $this->total_amount - ($this->paid_amount ?? 0)); }
    public function getPaymentStatusAttribute() {
        $paid = $this->paid_amount ?? 0;
        if ($paid >= $this->total_amount) return 'paid';
        if ($paid > 0) return 'partial';
        return 'unpaid';
    }
    public function isFullyPaid() { return ($this->paid_amount ?? 0) >= $this->total_amount; }


    /**
     * ✅ [تعديل] حساب إجمالي الكميات المرتجعة لكل صنف مخزون
     * 
     * @param int $inventoryItemId
     * @return int
     */
    public function getReturnedQuantity(int $inventoryItemId)
    {
        // البحث في عناصر المرتجعات (وليس المرتجعات نفسها)
        return PurchaseReturnItem::whereHas('purchaseReturn', function($query) {
            $query->where('purchase_invoice_id', $this->id)
                  ->where('status', '!=', 'rejected');
        })->where('inventory_item_id', $inventoryItemId)->sum('quantity'); // ✅ التغيير هنا
    }

    /**
     * ✅ [تعديل] حساب الكمية المتاحة للإرجاع لصنف مخزون معين
     * 
     * @param int $inventoryItemId
     * @return int
     */
    public function getAvailableReturnQuantity(int $inventoryItemId)
    {
        // الكمية الأصلية في الفاتورة
        $originalQuantity = $this->items()
            ->where('inventory_item_id', $inventoryItemId) // ✅ التغيير هنا
            ->sum('quantity');
        
        // الكمية المرتجعة
        $returnedQuantity = $this->getReturnedQuantity($inventoryItemId);
        
        // الكمية المتاحة للإرجاع
        return max(0, $originalQuantity - $returnedQuantity);
    }
}
