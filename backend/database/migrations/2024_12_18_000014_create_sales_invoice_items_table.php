<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * تشغيل ملفات الهجرة.
     *
     * جدول عناصر فاتورة البيع - النسخة المحسّنة لنظام FIFO.
     */
    public function up(): void
    {
        Schema::create('sales_invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sales_invoice_id')->constrained('sales_invoices')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            
            // =================================================================
            // **التعديلات الجوهرية**
            // =================================================================

            // 1. تغيير نوع الكمية إلى decimal لدعم الوحدات القابلة للتجزئة (مثل بيع 1.5 كيلو)
            $table->decimal('quantity', 10, 2);

            // 2. سعر بيع الوحدة (بدون تغيير)
            $table->decimal('unit_price', 10, 2);
            
            // 3. تغيير اسم العمود ليعكس الغرض الحقيقي منه بدقة
            // هذا هو سعر تكلفة الوحدة (من دفعة المخزون) في لحظة البيع
            // هذا هو مفتاح حساب الأرباح الدقيقة
            $table->decimal('cost_price_per_unit', 12, 4);

            // 4. الإجمالي (الكمية * سعر البيع) - (بدون تغيير)
            $table->decimal('total_price', 12, 2);
            
            // =================================================================
            
            $table->timestamps();
        });
    }

    /**
     * التراجع عن ملفات الهجرة.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales_invoice_items');
    }
};
