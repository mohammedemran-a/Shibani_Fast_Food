<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * تشغيل ملفات الهجرة.
     *
     * جدول المنتجات (Products) - النسخة النهائية.
     * يحتوي فقط على المعلومات التعريفية للمنتج.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // اسم المنتج
            $table->string('sku')->unique()->nullable(); // رمز المنتج الفريد (اختياري)
            $table->text('description')->nullable(); // وصف المنتج

            // العلاقات الأساسية
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->foreignId('brand_id')->nullable()->constrained('brands')->onDelete('set null');

            // =================================================================
            // **التعديل الرئيسي هنا: الأعمدة الجديدة والنظيفة**
            // =================================================================

            // 1. نوع المنتج (أساسي للتمييز بين منتجات العدد والوزن)
            $table->enum('product_type', ['Standard', 'Weighted'])->default('Standard');

            // 2. حد إعادة الطلب (بالوحدة الأساسية)
            $table->decimal('reorder_level', 10, 2)->default(0);
            
            // =================================================================

            $table->string('image')->nullable(); // صورة المنتج
            $table->boolean('is_active')->default(true); // حالة المنتج
            $table->timestamps();
        });
    }

    /**
     * التراجع عن ملفات الهجرة.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
