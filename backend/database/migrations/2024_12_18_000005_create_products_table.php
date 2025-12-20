<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * جدول المنتجات (Products)
     * يحتوي على جميع المنتجات في النظام
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // اسم المنتج (يمكن أن يكون عربي أو إنجليزي)
            $table->string('sku')->unique(); // رمز المنتج الفريد
            $table->string('barcode')->unique(); // الباركود
            $table->text('description')->nullable(); // وصف المنتج
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->foreignId('brand_id')->nullable()->constrained('brands')->onDelete('set null');
            $table->foreignId('unit_id')->constrained('units')->onDelete('cascade');
            $table->decimal('purchase_price', 10, 2); // سعر الشراء
            $table->decimal('selling_price', 10, 2); // سعر البيع
            $table->integer('quantity')->default(0); // الكمية المتوفرة
            $table->integer('reorder_level')->default(10); // حد إعادة الطلب
            $table->date('expiry_date')->nullable(); // تاريخ انتهاء الصلاحية
            $table->string('image')->nullable(); // صورة المنتج
            $table->boolean('is_active')->default(true); // حالة المنتج (مفعل/غير مفعل)
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
