<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * جدول حركات المخزون (Stock Movements)
     * يسجل جميع حركات الإدخال والإخراج والتعديلات على المخزون
     */
    public function up(): void
    {
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->enum('type', ['in', 'out', 'adjustment']); // نوع الحركة: إدخال، إخراج، تعديل
            $table->integer('quantity'); // الكمية
            $table->text('notes')->nullable(); // ملاحظات
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
