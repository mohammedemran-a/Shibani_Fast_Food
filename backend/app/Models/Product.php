<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Product extends Model
{
    use HasFactory;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'image',
        'type', // 'Sellable' or 'RawMaterial'
        'price',
        'category_id',
        'unit',
        'stock',
        'reorder_level',
        'cost',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price' => 'decimal:2',
        'stock' => 'decimal:3',
        'reorder_level' => 'decimal:3',
        'cost' => 'decimal:4',
        'is_active' => 'boolean',
    ];

    /**
     * علاقة: المنتج (الوجبة) ينتمي إلى فئة.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * علاقة: الوجبة تتكون من عدة مكونات (مواد خام).
     * هذه هي علاقة الوصفة المعيارية.
     */
    public function ingredients(): BelongsToMany
    {
        // ✅✅✅ هذا هو الإصلاح النهائي: استخدام أسماء الأعمدة الصحيحة ✅✅✅
        // تم إرجاع أسماء الأعمدة لتتطابق مع تصميم قاعدة البيانات الأصلي لديك.
        return $this->belongsToMany(Product::class, 'product_ingredients', 'sellable_product_id', 'raw_material_product_id')
                    ->withPivot('quantity'); // لجلب كمية المكون في الوصفة
    }

    /**
     * علاقة: الوجبة لديها العديد من الإضافات المتاحة.
     */
    public function availableModifiers(): BelongsToMany
    {
        return $this->belongsToMany(Modifier::class, 'product_modifiers');
    }
}
