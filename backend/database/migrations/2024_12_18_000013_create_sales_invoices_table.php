<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * جدول فواتير المبيعات (Sales Invoices) - نسخة المطاعم النهائية.
     * 
     * يدعم البيع النقدي السريع، والبيع الآجل للعملاء المسجلين.
     */
    public function up(): void
    {
        Schema::create('sales_invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique();
            
            // --- أعمدة العلاقات ---
            // عمود العميل (nullable لأنه قد يكون بيع نقدي سريع بدون عميل)
            $table->foreignId('customer_id')->nullable()->constrained('customers')->onDelete('set null');
            $table->foreignId('cashier_id')->constrained('users')->onDelete('cascade');
            
            $table->date('invoice_date');

            // --- الحقول المالية ---
            $table->decimal('subtotal', 10, 2);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2);

            // --- تفاصيل الدفع (مع دعم الديون) ---
            $table->enum('payment_method', ['Cash', 'Wallet', 'Debt'])->default('Cash');
            $table->string('wallet_name')->nullable();
            $table->string('transaction_code')->nullable();
            
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * التراجع عن ملفات الهجرة.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales_invoices');
    }
};
