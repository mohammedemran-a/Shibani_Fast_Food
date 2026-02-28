<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

/**
 * موديل المنتج (Product Model)
 * 
 * يمثل المنتج كوحدة أساسية في النظام. لم يعد يحتوي على كمية مباشرة،
 * بل أصبحت الكمية الإجمالية هي مجموع الكميات المتبقية في جميع دفعات المخزون.
 * هذا الموديل هو العقل المركزي الذي يربط المنتج بدفعاته، باركوداته، وفئاته.
 */
class Product extends Model
{
    use HasFactory;

    /**
     * الحقول القابلة للتعبئة بشكل جماعي (Mass Assignable).
     * تم تحديثها لتعكس الهيكل الجديد لجدول `products`.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'sku',
        'description',
        'category_id',
        'brand_id',
        'base_unit_name',        // اسم الوحدة الأساسية (مثال: "حبة")
        'purchase_price',        // متوسط سعر الشراء (سيتم تحديثه تلقائيًا)
        'selling_price',         // سعر بيع الوحدة الأساسية
        'reorder_level',         // حد إعادة الطلب (بالوحدة الأساسية)
        'image',
        'is_active',
    ];

    /**
     * تحويل أنواع البيانات (Casting).
     * تم تحديثها لضمان الدقة في التعامل مع الأرقام العشرية.
     *
     * @var array
     */
    protected $casts = [
        'purchase_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'reorder_level' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * الحقول المحسوبة التي يتم إضافتها تلقائيًا عند تحويل الموديل إلى مصفوفة أو JSON.
     * `total_quantity`: سيقوم بحساب إجمالي الكمية من جميع الدفعات.
     * `image_url`: سيقوم بإنشاء رابط كامل للصورة.
     *
     * @var array
     */
    protected $appends = ['total_quantity', 'image_url'];

    // =================================================================
    // **العلاقات الجديدة (New Relationships)**
    // =================================================================

    /**
     * علاقة: المنتج الواحد لديه العديد من دفعات المخزون (One-to-Many).
     * هذه هي العلاقة الأهم في النظام الجديد.
     */
    public function stockBatches(): HasMany
    {
        return $this->hasMany(ProductStockBatch::class);
    }

    /**
     * علاقة: المنتج الواحد لديه العديد من الباركودات/الوحدات (One-to-Many).
     */
    public function barcodes(): HasMany
    {
        return $this->hasMany(ProductBarcode::class);
    }

    // =================================================================
    // **العلاقات القديمة (Existing Relationships)**
    // =================================================================

    /**
     * علاقة: المنتج ينتمي إلى فئة واحدة.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * علاقة: المنتج ينتمي إلى علامة تجارية واحدة.
     */
    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    // =================================================================
    // **الحقول المحسوبة (Accessors)**
    // =================================================================

    /**
     * Accessor لحساب إجمالي الكمية المتوفرة من المنتج.
     * 
     * يقوم بجمع `quantity_remaining` من جميع دفعات المخزون المرتبطة بهذا المنتج.
     * هذا يضمن أن الكمية المعروضة دائمًا دقيقة وتعكس الواقع.
     *
     * @return float
     */
    public function getTotalQuantityAttribute(): float
    {
        // استخدام علاقة `stockBatches` مع دالة `sum` للحصول على المجموع بكفاءة.
        return (float) $this->stockBatches()->sum('quantity_remaining');
    }

    /**
     * Accessor للحصول على رابط الصورة الكامل.
     */
    public function getImageUrlAttribute(): ?string
    {
        if ($this->image) {
            return asset('storage/' . $this->image);
        }
        return null;
    }

    // =================================================================
    // **دوال مساعدة (Helper Methods)**
    // =================================================================

    /**
     * التحقق مما إذا كان المنتج قد وصل إلى حد إعادة الطلب.
     *
     * @return bool
     */
    public function isLowStock(): bool
    {
        return $this->getTotalQuantityAttribute() <= $this->reorder_level;
    }
     /* هذه الدالة تعرف علاقة "واحد إلى متعدد" بين المنتج وعناصر فواتير البيع.
     * هذا يسمح لنا بالتحقق مما إذا كان المنتج قد تم بيعه من قبل.
     */
    public function salesInvoiceItems(): HasMany
    {
        return $this->hasMany(SalesInvoiceItem::class);
    }
}
