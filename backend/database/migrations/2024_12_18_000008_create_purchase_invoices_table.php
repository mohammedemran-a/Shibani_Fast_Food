<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * جدول فواتير الشراء (Purchase Invoices) - نسخة المطاعم.
     * 
     * الغرض الأساسي: تسجيل شراء المواد الخام من الموردين،
     * وتكون هي المصدر لتحديث كميات وتكاليف المخزون.
     */
    public function up(): void
    {
        Schema::create('purchase_invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->nullable(); // رقم فاتورة المورد (ليس بالضرورة فريداً)
            $table->foreignId('supplier_id')->constrained('suppliers')->onDelete('cascade');
            $table->date('invoice_date'); // تاريخ الفاتورة

            // --- الحقول المالية الأساسية ---
            $table->decimal('total_amount', 12, 2); // المبلغ الإجمالي للفاتورة
            $table->decimal('paid_amount', 12, 2)->default(0); // المبلغ المدفوع للمورد
            
            // --- حقول الحالة والملاحظات ---
            // حقل status يحدد ما إذا كانت الفاتورة مدفوعة بالكامل أم لا
            $table->enum('status', ['Paid', 'PartiallyPaid', 'Unpaid'])->default('Unpaid');
            $table->text('notes')->nullable(); // ملاحظات
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade'); // من قام بإدخال الفاتورة
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_invoices');
    }
};
