<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // إضافة دعم الوحدات الفرعية
        Schema::table('units', function (Blueprint $table) {
            $table->foreignId('parent_unit_id')->nullable()->after('abbreviation')->constrained('units')->onDelete('cascade');
            $table->decimal('conversion_factor', 10, 4)->nullable()->after('parent_unit_id')->comment('عدد الوحدات الفرعية في الوحدة الرئيسية');
        });

        // جدول الباركودات المتعددة للمنتجات
        Schema::create('product_barcodes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('barcode')->unique();
            $table->foreignId('unit_id')->nullable()->constrained('units')->onDelete('set null');
            $table->decimal('quantity_per_unit', 10, 4)->default(1)->comment('كمية المنتج في هذه الوحدة');
            $table->decimal('price', 10, 2)->nullable()->comment('السعر لهذه الوحدة (اختياري)');
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_barcodes');
        
        Schema::table('units', function (Blueprint $table) {
            $table->dropForeign(['parent_unit_id']);
            $table->dropColumn(['parent_unit_id', 'conversion_factor']);
        });
    }
};
