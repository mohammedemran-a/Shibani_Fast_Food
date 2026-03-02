<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * جدول product_modifiers الوسيط.
     * 
     * يربط بين الوجبات (Products) والإضافات (Modifiers) المتاحة لها.
     */
    public function up(): void
    {
        Schema::create('product_modifiers', function (Blueprint $table) {
            // لا نحتاج لـ id هنا لأنه جدول وسيط بسيط
            
            // مفتاح خارجي للوجبة
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');

            // مفتاح خارجي للإضافة
            $table->foreignId('modifier_id')->constrained('modifiers')->onDelete('cascade');

            // تحديد المفتاح الأساسي المركب لمنع التكرار وضمان الأداء
            $table->primary(['product_id', 'modifier_id']);
        });
    }

    /**
     * التراجع عن ملفات الهجرة.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_modifiers');
    }
};
