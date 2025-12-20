<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * جدول المصروفات (Expenses)
     * يحتوي على المصروفات اليومية
     */
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->string('description'); // وصف المصروف (يمكن أن يكون عربي أو إنجليزي)
            $table->decimal('amount', 12, 2); // المبلغ
            $table->date('expense_date'); // تاريخ المصروف
            $table->foreignId('cashier_id')->constrained('users')->onDelete('cascade');
            $table->text('notes')->nullable(); // ملاحظات
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
