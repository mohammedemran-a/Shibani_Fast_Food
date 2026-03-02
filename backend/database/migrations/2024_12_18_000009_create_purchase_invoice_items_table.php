<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * جدول تفاصيل فواتير الشراء (Purchase Invoice Items) - نسخة المطاعم.
     * 
     * يسجل كل مادة خام تم شراؤها في فاتورة معينة.
     * هذا الجدول هو المحرك الرئيسي لتحديث المخزون ومتوسط التكلفة.
     */
    public function up(): void
    {
        Schema::create('purchase_invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_invoice_id')->constrained('purchase_invoices')->onDelete('cascade');
            
            // يجب أن يشير إلى منتج من نوع 'RawMaterial'
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            
            // الكمية المشتراة (decimal لدعم الأوزان)
            $table->decimal('quantity', 12, 3);
            
            // سعر شراء الوحدة الواحدة من المادة الخام
            $table->decimal('purchase_price_per_unit', 12, 4);
            
            // الإجمالي (يمكن حسابه، لكن وجوده يسهل مراجعة الفواتير)
            $table->decimal('total_price', 12, 2);
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_invoice_items');
    }
};
