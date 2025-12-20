<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * نموذج المنتج
 * 
 * يمثل المنتجات في النظام مع جميع التفاصيل المتعلقة بها
 * مثل الأسعار، الكميات، الصور، والعلاقات مع الفئات والعلامات التجارية
 */
class Product extends Model
{
    use HasFactory;

    /**
     * الحقول القابلة للتعبئة
     * 
     * @var array
     */
    protected $fillable = [
        'name',              // اسم المنتج
        'sku',               // رمز المنتج (Stock Keeping Unit)
        'barcode',           // الباركود
        'category_id',       // معرف الفئة
        'brand_id',          // معرف العلامة التجارية
        'unit_id',           // معرف وحدة القياس
        'purchase_price',    // سعر الشراء
        'selling_price',     // سعر البيع
        'quantity',          // الكمية المتوفرة
        'reorder_level',     // مستوى إعادة الطلب (تنبيه عند انخفاض المخزون)
        'expiry_date',       // تاريخ انتهاء الصلاحية
        'description',       // وصف المنتج
        'image',             // مسار الصورة
        'is_active',         // حالة التفعيل (نشط/غير نشط)
    ];

    /**
     * تحويل أنواع البيانات
     * 
     * @var array
     */
    protected $casts = [
        'purchase_price' => 'float',    // تحويل سعر الشراء إلى رقم عشري
        'selling_price' => 'float',     // تحويل سعر البيع إلى رقم عشري
        'quantity' => 'integer',        // تحويل الكمية إلى رقم صحيح
        'reorder_level' => 'integer',   // تحويل مستوى إعادة الطلب إلى رقم صحيح
        'is_active' => 'boolean',       // تحويل حالة التفعيل إلى قيمة منطقية
        'expiry_date' => 'date',        // تحويل تاريخ الصلاحية إلى كائن تاريخ
    ];

    /**
     * الحقول المضافة تلقائياً للنموذج
     * 
     * @var array
     */
    protected $appends = ['image_url'];

    /**
     * العلاقة مع الفئة
     * 
     * كل منتج ينتمي إلى فئة واحدة
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * العلاقة مع العلامة التجارية
     * 
     * كل منتج ينتمي إلى علامة تجارية واحدة (اختياري)
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    /**
     * العلاقة مع وحدة القياس
     * 
     * كل منتج له وحدة قياس واحدة (كيلو، قطعة، لتر، إلخ)
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    /**
     * العلاقة مع الباركودات
     * 
     * المنتج يمكن أن يكون له عدة باركودات
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function barcodes()
    {
        return $this->hasMany(ProductBarcode::class);
    }

    /**
     * Accessor للحصول على رابط الصورة الكامل
     * 
     * يقوم بتحويل مسار الصورة النسبي إلى رابط كامل
     * 
     * @return string|null
     */
    public function getImageUrlAttribute()
    {
        if ($this->image) {
            return asset('storage/' . $this->image);
        }
        return null;
    }

    /**
     * التحقق من أن المنتج في حالة تنبيه مخزون منخفض
     * 
     * @return bool
     */
    public function isLowStock()
    {
        return $this->quantity <= $this->reorder_level;
    }

    /**
     * التحقق من أن المنتج متوفر في المخزون
     * 
     * @return bool
     */
    public function isInStock()
    {
        return $this->quantity > 0;
    }

    /**
     * Scope للمنتجات النشطة فقط
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope للمنتجات ذات المخزون المنخفض
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeLowStock($query)
    {
        return $query->whereColumn('quantity', '<=', 'reorder_level');
    }
}
