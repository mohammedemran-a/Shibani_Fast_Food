<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * جدول المصروفات (Expenses) - نسخة موسعة.
     * 
     * يحتوي على جميع المصروفات التشغيلية، بما في ذلك:
     * - المصروفات النثرية (فواتير، ضيافة).
     * - تكلفة وجبات الموظفين.
     * - تكلفة الهدر الناتج عن تسويات المخزون.
     */
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->string('description'); // وصف المصروف
            $table->decimal('amount', 10, 2); // المبلغ
            $table->date('expense_date'); // تاريخ المصروف

            // --- حقول جديدة للتصنيف والتتبع ---
            $table->string('category')->default('General'); // فئة المصروف (مثل: فواتير, ضيافة موظفين, هدر مخزون)
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null'); // الموظف الذي سجل المصروف أو تسبب به
            
            $table->text('notes')->nullable(); // ملاحظات إضافية
            $table->timestamps();
        });
    }

    /**
     * التراجع عن ملفات الهجرة.
     */
    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
