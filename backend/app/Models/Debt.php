<?php

// backend/app/Models/Debt.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Debt extends Model
{
    use HasFactory;

    /**
     * // الحقول القابلة للتعبئة بشكل جماعي
     * @var array
     */
    protected $fillable = [
        'customer_id',
        'sales_invoice_id',
        'amount',
        'paid_amount',
        'status',
        'due_date',
        'notes',
    ];

    /**
     * // تحويل أنواع البيانات للحقول
     * @var array
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'due_date' => 'date',
    ];

    /**
     * // العلاقة مع العميل
     * // كل دين ينتمي إلى عميل واحد
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * // العلاقة مع فاتورة البيع
     * // كل دين ينتمي إلى فاتورة بيع واحدة
     */
    public function salesInvoice()
    {
        return $this->belongsTo(SalesInvoice::class);
    }

    /**
     * // العلاقة مع الدفعات
     * // كل سجل دين له العديد من سجلات الدفعات
     */
    public function payments()
    {
        return $this->hasMany(DebtPayment::class);
    }
}
