<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * جدول المرتجعات (Returns)
     * يحتوي على مرتجعات المشتريات للموردين
     */
    public function up(): void
    {
        Schema::create('returns', function (Blueprint $table) {
            $table->id();
            $table->string('return_number')->unique(); // رقم المرتجع (تلقائي)
            $table->foreignId('purchase_invoice_id')->nullable()->constrained('purchase_invoices')->onDelete('set null');
            $table->foreignId('supplier_id')->constrained('suppliers')->onDelete('cascade');
            $table->date('return_date'); // تاريخ الإرجاع
            $table->decimal('total_amount', 12, 2); // المبلغ الإجمالي
            $table->text('reason')->nullable(); // سبب الإرجاع
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending'); // الحالة
            $table->text('notes')->nullable(); // ملاحظات إضافية
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('returns');
    }
};
