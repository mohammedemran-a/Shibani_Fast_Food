<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * نموذج مرتجعات المشتريات (Purchase Returns)
 * 
 * يمثل مرتجعات المشتريات للموردين
 * يرتبط بفاتورة الشراء الأصلية ويحتوي على عناصر مرتجعة
 */
class PurchaseReturn extends Model
{
    use HasFactory;

    protected $table = 'returns';

    protected $fillable = [
        'return_number',
        'purchase_invoice_id',
        'supplier_id',
        'return_date',
        'total_amount',
        'reason',
        'status',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'return_date' => 'date',
        'total_amount' => 'decimal:2',
    ];

    /**
     * توليد رقم مرتجع تلقائي
     * التنسيق: RET-YYYYMMDD-XXXX
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($return) {
            if (empty($return->return_number)) {
                $date = date('Ymd');
                $lastReturn = static::whereDate('created_at', today())
                    ->orderBy('id', 'desc')
                    ->first();
                
                $sequence = $lastReturn ? (intval(substr($lastReturn->return_number, -4)) + 1) : 1;
                $return->return_number = 'RET-' . $date . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
            }
        });
    }

    /**
     * العلاقة مع فاتورة الشراء
     */
    public function purchaseInvoice()
    {
        return $this->belongsTo(PurchaseInvoice::class);
    }

    /**
     * العلاقة مع المورد
     */
    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * العلاقة مع عناصر المرتجع
     */
    public function items()
    {
        return $this->hasMany(PurchaseReturnItem::class, 'return_id');
    }

    /**
     * العلاقة مع المستخدم المنشئ
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scopes
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }
}
