<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * نموذج عناصر المرتجعات (Return Items)
 * 
 * يمثل المنتجات المرتجعة في كل مرتجع
 */
class ReturnItem extends Model
{
    use HasFactory;

    protected $table = 'return_items';

    protected $fillable = [
        'return_id',
        'product_id',
        'quantity',
        'unit_price',
        'total_price',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
    ];

    /**
     * العلاقة مع المرتجع
     */
    public function return()
    {
        return $this->belongsTo(Return::class, 'return_id');
    }

    /**
     * العلاقة مع المنتج
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
