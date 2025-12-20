<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('purchase_returns', function (Blueprint $table) {
            $table->id();
            
            // رقم المرتجع (تلقائي: RET-YYYYMMDD-XXXX)
            $table->string('return_number')->unique();
            
            // معرف فاتورة الشراء الأصلية
            $table->foreignId('purchase_invoice_id')
                  ->constrained('purchase_invoices')
                  ->onDelete('cascade');
            
            // معرف المنتج المرتجع
            $table->foreignId('product_id')
                  ->constrained('products')
                  ->onDelete('cascade');
            
            // الكمية المرتجعة
            $table->integer('quantity');
            
            // سعر الوحدة (من الفاتورة الأصلية)
            $table->decimal('unit_price', 10, 2);
            
            // السعر الإجمالي للمرتجع
            $table->decimal('total_price', 10, 2);
            
            // سبب الإرجاع
            $table->string('reason')->nullable();
            
            // تاريخ الإرجاع
            $table->date('return_date');
            
            // حالة المرتجع (pending, approved, rejected)
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            
            // ملاحظات إضافية
            $table->text('notes')->nullable();
            
            // معرف المستخدم الذي أنشأ المرتجع
            $table->foreignId('created_by')
                  ->constrained('users')
                  ->onDelete('cascade');
            
            $table->timestamps();
            
            // فهرس لتحسين الأداء
            $table->index(['purchase_invoice_id', 'product_id']);
            $table->index('return_date');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_returns');
    }
};
