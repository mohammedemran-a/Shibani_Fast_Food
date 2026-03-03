<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * إضافة فهارس (Indexes) لتحسين أداء الاستعلامات - نسخة المطاعم.
     */
    public function up(): void
    {
        // تحسين جدول المنتجات (Products)
        Schema::table('products', function (Blueprint $table) {
            $table->index('category_id');
            $table->index('type'); // مهم جداً للفلترة بين المواد الخام والوجبات
            $table->index('is_active');
            $table->index('name'); // للبحث بالاسم
        });

        // تحسين جدول فواتير المبيعات (Sales Invoices)
        Schema::table('sales_invoices', function (Blueprint $table) {
            // سنبقي على customer_id لأننا قررنا الإبقاء على نظام الديون
            $table->index('customer_id'); 
            $table->index('cashier_id');
            $table->index('invoice_date');
            $table->index('payment_method'); // تم تغيير status إلى payment_method
            $table->index('created_at');
        });

        // تحسين جدول بنود فواتير المبيعات (Sales Invoice Items)
        Schema::table('sales_invoice_items', function (Blueprint $table) {
            $table->index('sales_invoice_id');
            $table->index('product_id');
        });

        // تحسين جدول فواتير الشراء (Purchase Invoices)
        Schema::table('purchase_invoices', function (Blueprint $table) {
            $table->index('supplier_id');
            $table->index('invoice_date');
            $table->index('status');
        });

        // تحسين جدول الحضور والانصراف (Attendances)
        Schema::table('attendances', function (Blueprint $table) {
            $table->index('employee_id');
            $table->index('date');
            $table->index('status');
        });
    }

    /**
     * التراجع عن إضافة الفهارس.
     */
    public function down(): void
    {
        // يجب أن تعكس دالة down التغييرات في دالة up
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['category_id']);
            $table->dropIndex(['type']);
            $table->dropIndex(['is_active']);
            $table->dropIndex(['name']);
        });

        Schema::table('sales_invoices', function (Blueprint $table) {
            $table->dropIndex(['customer_id']);
            $table->dropIndex(['cashier_id']);
            $table->dropIndex(['invoice_date']);
            $table->dropIndex(['payment_method']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('sales_invoice_items', function (Blueprint $table) {
            $table->dropIndex(['sales_invoice_id']);
            $table->dropIndex(['product_id']);
        });

        Schema::table('purchase_invoices', function (Blueprint $table) {
            $table->dropIndex(['supplier_id']);
            $table->dropIndex(['invoice_date']);
            $table->dropIndex(['status']);
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->dropIndex(['employee_id']);
            $table->dropIndex(['date']);
            $table->dropIndex(['status']);
        });
    }
};
