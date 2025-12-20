<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * جدول نقاط الولاء (Loyalty Points)
     * يحتوي على حركات نقاط الولاء للعملاء
     */
    public function up(): void
    {
        Schema::create('loyalty_points', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->integer('points'); // عدد النقاط
            $table->enum('type', ['earned', 'redeemed', 'expired'])->default('earned'); // نوع الحركة
            $table->foreignId('sales_invoice_id')->nullable()->constrained('sales_invoices')->onDelete('set null');
            $table->date('expiry_date')->nullable(); // تاريخ انتهاء الصلاحية
            $table->text('notes')->nullable(); // ملاحظات
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loyalty_points');
    }
};
