<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * جدول فواتير الشراء (Purchase Invoices)
     * يحتوي على فواتير الشراء من الموردين
     */
    public function up(): void
    {
        Schema::create('purchase_invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique(); // رقم الفاتورة (تلقائي)
            $table->foreignId('supplier_id')->constrained('suppliers')->onDelete('cascade');
            $table->date('invoice_date'); // تاريخ الفاتورة
            $table->date('due_date')->nullable(); // تاريخ الاستحقاق
            $table->decimal('subtotal', 12, 2)->default(0); // المجموع الفرعي
            $table->decimal('tax_amount', 12, 2)->default(0); // قيمة الضريبة
            $table->decimal('discount_amount', 12, 2)->default(0); // قيمة الخصم
            $table->decimal('total_amount', 12, 2); // المجموع الإجمالي
            $table->decimal('paid_amount', 12, 2)->default(0); // المبلغ المدفوع
            $table->enum('status', ['pending', 'completed', 'cancelled'])->default('pending'); // الحالة
            $table->text('notes')->nullable(); // ملاحظات
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_invoices');
    }
};
