<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // التحقق أولاً إذا كان الجدول غير موجود لتجنب الخطأ
        if (!Schema::hasTable('product_barcodes')) {
            Schema::create('product_barcodes', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
                $table->string('unit_name');
                $table->string('barcode')->nullable()->unique();
                $table->decimal('unit_quantity', 10, 2);
                $table->decimal('selling_price', 10, 2)->nullable();
                $table->timestamps();
                $table->boolean('is_base_unit')->default(false);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_barcodes');
    }
};
