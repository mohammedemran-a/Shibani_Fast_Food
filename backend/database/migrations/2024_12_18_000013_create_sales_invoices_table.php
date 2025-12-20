<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * جدول فواتير المبيعات (Sales Invoices)
     * يحتوي على فواتير البيع للعملاء
     */
    public function up(): void
    {
        Schema::create('sales_invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique(); // رقم الفاتورة (تلقائي)
            $table->foreignId('customer_id')->nullable()->constrained('customers')->onDelete('set null');
            $table->foreignId('cashier_id')->constrained('users')->onDelete('cascade');
            $table->date('invoice_date'); // تاريخ الفاتورة
            $table->decimal('subtotal', 12, 2); // المجموع الفرعي
            $table->decimal('tax_amount', 12, 2)->default(0); // قيمة الضريبة
            $table->decimal('discount_amount', 12, 2)->default(0); // قيمة الخصم
            $table->decimal('total_amount', 12, 2); // المجموع الإجمالي
            $table->enum('payment_method', ['cash', 'wallet', 'debt'])->default('cash'); // طريقة الدفع
            $table->string('wallet_name')->nullable(); // اسم المحفظة (إذا كانت طريقة الدفع محفظة)
            $table->string('transaction_code')->nullable(); // رمز المعاملة
            $table->enum('status', ['completed', 'cancelled'])->default('completed'); // الحالة
            $table->text('notes')->nullable(); // ملاحظات
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_invoices');
    }
};
