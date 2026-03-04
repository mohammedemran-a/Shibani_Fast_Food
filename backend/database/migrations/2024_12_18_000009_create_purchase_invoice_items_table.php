<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_invoice_items', function (Blueprint $table) {
            $table->id();
            
            // ✅✅✅ هذا هو التصحيح الحاسم ✅✅✅
            // علاقة الحذف المتتالي يجب أن تكون هنا على الفاتورة
            $table->foreignId('purchase_invoice_id')->constrained('purchase_invoices')->onDelete('cascade');
            
            // الربط مع جدول المنتجات (بدون حذف متتالي من هنا)
            // هذا يمنع حذف المنتج عند حذف الفاتورة، وهو السلوك الصحيح
            $table->foreignId('product_id')->constrained('products');
            
            $table->decimal('quantity', 10, 2);
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_price', 10, 2);
            $table->date('expiry_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_invoice_items');
    }
};
