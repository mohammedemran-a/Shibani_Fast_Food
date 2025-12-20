<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * جدول دفعات الديون (Debt Payments)
     * يحتوي على دفعات سداد الديون
     */
    public function up(): void
    {
        Schema::create('debt_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('debt_id')->constrained('debts')->onDelete('cascade');
            $table->decimal('amount', 12, 2); // المبلغ المدفوع
            $table->date('payment_date'); // تاريخ الدفع
            $table->enum('payment_method', ['cash', 'wallet', 'check'])->default('cash'); // طريقة الدفع
            $table->string('transaction_code')->nullable(); // رمز المعاملة
            $table->text('notes')->nullable(); // ملاحظات
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('debt_payments');
    }
};
