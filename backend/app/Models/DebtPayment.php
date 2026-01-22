<?php

// backend/app/Models/DebtPayment.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DebtPayment extends Model
{
    use HasFactory;

    /**
     * // الحقول القابلة للتعبئة بشكل جماعي
     * @var array
     */
    protected $fillable = [
        'debt_id',
        'amount',
        'payment_date',
        'payment_method',
        'transaction_code',
        'notes',
        'created_by',
    ];

    /**
     * // تحويل أنواع البيانات للحقول
     * @var array
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'date',
    ];

    /**
     * // العلاقة مع الدين
     * // كل دفعة تنتمي إلى سجل دين واحد
     */
    public function debt()
    {
        return $this->belongsTo(Debt::class);
    }

    /**
     * // العلاقة مع المستخدم الذي أنشأ الدفعة
     * // كل دفعة تم إنشاؤها بواسطة مستخدم واحد
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
