<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryAdjustment extends Model
{
    use HasFactory;

    /**
     * السمات التي يمكن تعبئتها بشكل جماعي.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'product_id',
        'type',
        'quantity',
        'reason',
        'user_id',
    ];

    /**
     * السمات التي يجب تحويلها إلى أنواع بيانات أصلية.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'quantity' => 'decimal:3',
    ];

    /**
     * علاقة: التسوية تنتمي إلى منتج (مادة خام).
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * علاقة: التسوية تم إنشاؤها بواسطة مستخدم.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
