<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * نموذج طرق الدفع
 * 
 * يمثل طرق الدفع المتاحة في النظام (محافظ إلكترونية، بطاقات، إلخ)
 */
class PaymentMethod extends Model
{
    use HasFactory;

    /**
     * الحقول القابلة للتعبئة
     */
    protected $fillable = [
        'name',
        'icon',
        'is_active',
    ];

    /**
     * تحويل الحقول إلى أنواع محددة
     */
    protected $casts = [
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Scope للطرق المفعلة فقط
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * علاقة مع فواتير المبيعات
     */
    public function salesInvoices()
    {
        return $this->hasMany(SalesInvoice::class, 'payment_method_id');
    }
}
