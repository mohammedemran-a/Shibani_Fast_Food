<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * جدول إضافات عنصر فاتورة البيع (Sales Invoice Item Modifiers).
     * 
     * جدول محوري يسجل الإضافات التي اختارها العميل لكل عنصر في الفاتورة.
     */
    public function up(): void
    {
        Schema::create('sales_invoice_item_modifiers', function (Blueprint $table) {
            $table->id();
            
            // مفتاح خارجي لبند الفاتورة
            $table->foreignId('sales_invoice_item_id')->constrained('sales_invoice_items')->onDelete('cascade');

            // مفتاح خارجي للإضافة المختارة
            $table->foreignId('modifier_id')->constrained('modifiers')->onDelete('cascade');

            // كمية الإضافة (عادة 1، لكن قد تكون أكثر لبعض الإضافات)
            $table->integer('quantity')->default(1);

            // سعر الإضافة في لحظة البيع (مهم لضمان ثبات الفواتير القديمة)
            $table->decimal('price', 10, 2);
        });
    }

    /**
     * التراجع عن ملفات الهجرة.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales_invoice_item_modifiers');
    }
};
