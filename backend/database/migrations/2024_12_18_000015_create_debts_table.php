<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * جدول الديون (Debts)
     * يحتوي على ديون العملاء
     */
    public function up(): void
    {
        Schema::create('debts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->foreignId('sales_invoice_id')->constrained('sales_invoices')->onDelete('cascade');
            $table->decimal('amount', 12, 2); // المبلغ الإجمالي
            $table->decimal('paid_amount', 12, 2)->default(0); // المبلغ المدفوع
            $table->enum('status', ['pending', 'partial', 'paid'])->default('pending'); // الحالة
            $table->date('due_date')->nullable(); // تاريخ الاستحقاق
            $table->text('notes')->nullable(); // ملاحظات
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('debts');
    }
};
