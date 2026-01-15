<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // تحسين جدول المنتجات
        Schema::table('products', function (Blueprint $table) {
            $table->index('category_id');
            $table->index('brand_id');
            $table->index('is_active');
            $table->index('name'); // للبحث بالاسم
        });

        // تحسين جدول فواتير المبيعات
        Schema::table('sales_invoices', function (Blueprint $table) {
            $table->index('customer_id');
            $table->index('cashier_id');
            $table->index('invoice_date');
            $table->index('status');
            $table->index('created_at');
        });

        // تحسين جدول بنود الفواتير
        Schema::table('sales_invoice_items', function (Blueprint $table) {
            $table->index('sales_invoice_id');
            $table->index('product_id');
        });

        // تحسين جدول حركات المخزون
        Schema::table('stock_movements', function (Blueprint $table) {
            $table->index('product_id');
            $table->index('type');
            $table->index('created_at');
        });

        // تحسين جدول الحضور والانصراف
        Schema::table('attendances', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('date');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['category_id']);
            $table->dropIndex(['brand_id']);
            $table->dropIndex(['is_active']);
            $table->dropIndex(['name']);
        });

        Schema::table('sales_invoices', function (Blueprint $table) {
            $table->dropIndex(['customer_id']);
            $table->dropIndex(['cashier_id']);
            $table->dropIndex(['invoice_date']);
            $table->dropIndex(['status']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('sales_invoice_items', function (Blueprint $table) {
            $table->dropIndex(['sales_invoice_id']);
            $table->dropIndex(['product_id']);
        });

        Schema::table('stock_movements', function (Blueprint $table) {
            $table->dropIndex(['product_id']);
            $table->dropIndex(['type']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['date']);
            $table->dropIndex(['status']);
        });
    }
};
