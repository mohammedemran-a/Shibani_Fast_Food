<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        
        'sku',
        'barcode',
        'category_id',
        'brand_id',
        'unit_id',
        'purchase_price',
        'selling_price',
        'quantity',

        'reorder_level',
        'expiry_date',
        'description',
        'image',
        'is_active',
    ];

    protected $casts = [
        'purchase_price' => 'float',
        'selling_price' => 'float',
        'quantity' => 'integer',
        'reorder_level' => 'integer',
        'is_active' => 'boolean',
        'expiry_date' => 'date',
    ];

    // العلاقات
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    // Accessor للصورة
    public function getImageUrlAttribute()
    {
        if ($this->image) {
            return asset('storage/' . $this->image);
        }
        return null;
    }

    public function barcodes()
    {
        return $this->hasMany(ProductBarcode::class);
    }
}
