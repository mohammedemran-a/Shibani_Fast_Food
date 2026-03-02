<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * جدول المنتجات (Products) - نسخة المطاعم النهائية.
     * 
     * هذا الجدول هو المحور المركزي للنظام، حيث يُعرّف:
     * 1. المواد الخام التي يتم شراؤها وتخزينها (type = 'RawMaterial').
     * 2. الوجبات والمشروبات القابلة للبيع للعميل (type = 'Sellable').
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // اسم المنتج (سواء كان وجبة أو مادة خام)
            $table->text('description')->nullable(); // وصف الوجبة
            $table->string('image')->nullable(); // صورة الوجبة (للنوع القابل للبيع)
            
            // --- العمود المحوري لتحديد طبيعة المنتج ---
            $table->enum('type', ['Sellable', 'RawMaterial'])->default('Sellable');

            // --- حقول خاصة بالوجبات القابلة للبيع (Sellable) ---
            $table->decimal('price', 10, 2)->nullable(); // سعر البيع للعميل (لا ينطبق على المواد الخام)
            $table->foreignId('category_id')->nullable()->constrained('categories')->onDelete('set null'); // الوجبة تنتمي لأي فئة في المنيو

            // --- حقول خاصة بالمواد الخام (RawMaterial) ---
            $table->string('unit')->nullable(); // وحدة القياس (kg, piece, liter)
            $table->decimal('stock', 12, 3)->default(0); // الرصيد الفعلي في المخزون
            $table->decimal('reorder_level', 12, 3)->nullable(); // حد إعادة الطلب للتنبيه

            // --- حقول مشتركة ومهمة ---
            $table->decimal('cost', 12, 4)->default(0); // تكلفة الوجبة (محسوبة) أو متوسط تكلفة المادة الخام
            $table->boolean('is_active')->default(true); // هل المنتج (وجبة/مادة خام) نشط؟
            
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
