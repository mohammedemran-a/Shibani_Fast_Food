<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * جدول عناصر فاتورة البيع (Sales Invoice Items) - نسخة المطاعم.
     * 
     * يسجل كل وجبة أو مشروب تم بيعه داخل فاتورة معينة.
     * الأهم: يسجل سعر البيع وتكلفة الوجبة في لحظة البيع لحساب الأرباح بدقة.
     */
    public function up(): void
    {
        Schema::create('sales_invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sales_invoice_id')->constrained('sales_invoices')->onDelete('cascade');
            
            // يرتبط بالمنتج القابل للبيع (الوجبة)
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            
            // --- الحقول الأساسية لعملية البيع ---

            // 1. الكمية المباعة من الوجبة (عادة تكون عدد صحيح في المطاعم)
            $table->integer('quantity');

            // 2. سعر بيع الوحدة الواحدة من الوجبة في لحظة البيع
            // يتم تسجيله هنا لضمان عدم تأثر الفواتير القديمة عند تغيير سعر الوجبة في المستقبل
            $table->decimal('unit_price', 10, 2);
            
            // 3. **التعديل الجوهري:** تكلفة الوحدة الواحدة من الوجبة في لحظة البيع
            // هذه التكلفة يتم حسابها من (مجموع تكاليف مكونات الوصفة المعيارية)
            // وتسجيلها هنا يضمن حساب ربح دقيق لكل عملية بيع
            $table->decimal('unit_cost', 10, 4);

            // 4. ملاحظات خاصة بهذا البند فقط (مثل: "بدون بصل"، "حار جداً")
            // هذه الملاحظات يتم إضافتها من قبل الكاشير
            $table->string('notes')->nullable();

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
