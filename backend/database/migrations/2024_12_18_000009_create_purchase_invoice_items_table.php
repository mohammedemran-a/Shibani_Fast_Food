<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * ✅ جدول تفاصيل فواتير الشراء (النسخة النهائية والمحدثة)
     * 
     * يسجل كل صنف مخزون تم شراؤه في فاتورة معينة.
     */
    public function up(): void
    {
        Schema::create('purchase_invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_invoice_id')->constrained('purchase_invoices')->onDelete('cascade');
            
            // ✅ [تعديل] الربط مع جدول أصناف المخزون
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->onDelete('cascade');
            
            // الكمية المشتراة (decimal لدعم الأوزان)
            $table->decimal('quantity', 10, 2);
            
            // سعر شراء الوحدة الواحدة من الصنف
            $table->decimal('unit_price', 10, 2);
            
            // الإجمالي (يمكن حسابه، لكن وجوده يسهل مراجعة الفواتير)
            $table->decimal('total_price', 10, 2);

            $table->text('notes')->nullable(); // إضافة حقل الملاحظات
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_invoice_items');
    }
};
