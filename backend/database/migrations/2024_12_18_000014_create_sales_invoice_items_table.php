<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * جدول تفاصيل فواتير المبيعات (Sales Invoice Items)
     * يحتوي على المنتجات في كل فاتورة بيع
     */
    public function up(): void
    {
        Schema::create('sales_invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sales_invoice_id')->constrained('sales_invoices')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->integer('quantity'); // الكمية
            $table->decimal('unit_price', 10, 2); // سعر الوحدة
            $table->decimal('total_price', 12, 2); // السعر الإجمالي
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_invoice_items');
    }
};
