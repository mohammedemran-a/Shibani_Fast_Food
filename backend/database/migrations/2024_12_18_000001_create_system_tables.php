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
        // جدول الوحدات (Units)
        Schema::create('units', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('abbreviation');
            $table->timestamps();
        });

        // جدول العملات (Currencies)
        Schema::create('currencies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('symbol');
            $table->decimal('exchange_rate', 10, 4)->default(1);
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });

        // جدول الفئات (Categories)
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->timestamps();
        });

        // جدول العلامات التجارية (Brands)
        Schema::create('brands', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('logo')->nullable();
            $table->timestamps();
        });

        // جدول المنتجات (Products)
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('sku')->unique();
            $table->string('barcode')->unique();
            $table->text('description')->nullable();
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->foreignId('brand_id')->nullable()->constrained('brands')->onDelete('set null');
            $table->foreignId('unit_id')->constrained('units')->onDelete('cascade');
            $table->decimal('purchase_price', 10, 2);
            $table->decimal('selling_price', 10, 2);
            $table->integer('quantity')->default(0);
            $table->integer('reorder_level')->default(10);
            $table->date('expiry_date')->nullable();
            $table->string('image')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // جدول حركات المخزون (Stock Movements)
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->enum('type', ['in', 'out', 'adjustment']);
            $table->integer('quantity');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // جدول الموردين (Suppliers)
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone');
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('country')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // جدول فواتير الشراء (Purchase Invoices)
        Schema::create('purchase_invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique();
            $table->foreignId('supplier_id')->constrained('suppliers')->onDelete('cascade');
            $table->date('invoice_date');
            $table->date('due_date')->nullable();
            $table->decimal('total_amount', 12, 2);
            $table->decimal('paid_amount', 12, 2)->default(0);
            $table->enum('status', ['pending', 'partial', 'paid', 'cancelled'])->default('pending');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // جدول تفاصيل فواتير الشراء (Purchase Invoice Items)
        Schema::create('purchase_invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_invoice_id')->constrained('purchase_invoices')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_price', 12, 2);
            $table->timestamps();
        });

        // جدول المرتجعات (Returns)
        Schema::create('returns', function (Blueprint $table) {
            $table->id();
            $table->string('return_number')->unique();
            $table->foreignId('purchase_invoice_id')->nullable()->constrained('purchase_invoices')->onDelete('set null');
            $table->foreignId('supplier_id')->constrained('suppliers')->onDelete('cascade');
            $table->date('return_date');
            $table->decimal('total_amount', 12, 2);
            $table->text('reason')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // جدول تفاصيل المرتجعات (Return Items)
        Schema::create('return_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('return_id')->constrained('returns')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_price', 12, 2);
            $table->timestamps();
        });

        // جدول العملاء (Customers)
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone');
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('country')->nullable();
            $table->text('notes')->nullable();
            $table->decimal('loyalty_points', 10, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // جدول الفواتير (Sales Invoices)
        Schema::create('sales_invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->onDelete('set null');
            $table->foreignId('cashier_id')->constrained('users')->onDelete('cascade');
            $table->date('invoice_date');
            $table->decimal('subtotal', 12, 2);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2);
            $table->enum('payment_method', ['cash', 'wallet', 'debt'])->default('cash');
            $table->string('wallet_name')->nullable();
            $table->string('transaction_code')->nullable();
            $table->enum('status', ['completed', 'cancelled'])->default('completed');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // جدول تفاصيل الفواتير (Sales Invoice Items)
        Schema::create('sales_invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sales_invoice_id')->constrained('sales_invoices')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_price', 12, 2);
            $table->timestamps();
        });

        // جدول الديون (Debts)
        Schema::create('debts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->foreignId('sales_invoice_id')->constrained('sales_invoices')->onDelete('cascade');
            $table->decimal('amount', 12, 2);
            $table->decimal('paid_amount', 12, 2)->default(0);
            $table->enum('status', ['pending', 'partial', 'paid'])->default('pending');
            $table->date('due_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // جدول دفعات الديون (Debt Payments)
        Schema::create('debt_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('debt_id')->constrained('debts')->onDelete('cascade');
            $table->decimal('amount', 12, 2);
            $table->date('payment_date');
            $table->enum('payment_method', ['cash', 'wallet', 'check'])->default('cash');
            $table->string('transaction_code')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // جدول المصروفات (Expenses)
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->string('description');
            $table->string('description_ar');
            $table->decimal('amount', 12, 2);
            $table->date('expense_date');
            $table->foreignId('cashier_id')->constrained('users')->onDelete('cascade');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // جدول جلسات الكاشير (Cashier Sessions)
        Schema::create('cashier_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cashier_id')->constrained('users')->onDelete('cascade');
            $table->dateTime('start_time');
            $table->dateTime('end_time')->nullable();
            $table->decimal('opening_balance', 12, 2)->default(0);
            $table->decimal('closing_balance', 12, 2)->nullable();
            $table->enum('status', ['open', 'closed'])->default('open');
            $table->timestamps();
        });

        // جدول نقاط الولاء (Loyalty Points)
        Schema::create('loyalty_points', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->integer('points');
            $table->enum('type', ['earned', 'redeemed', 'expired'])->default('earned');
            $table->foreignId('sales_invoice_id')->nullable()->constrained('sales_invoices')->onDelete('set null');
            $table->date('expiry_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // جدول إعدادات النظام (System Settings)
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loyalty_points');
        Schema::dropIfExists('cashier_sessions');
        Schema::dropIfExists('expenses');
        Schema::dropIfExists('debt_payments');
        Schema::dropIfExists('debts');
        Schema::dropIfExists('sales_invoice_items');
        Schema::dropIfExists('sales_invoices');
        Schema::dropIfExists('customers');
        Schema::dropIfExists('return_items');
        Schema::dropIfExists('returns');
        Schema::dropIfExists('purchase_invoice_items');
        Schema::dropIfExists('purchase_invoices');
        Schema::dropIfExists('suppliers');
        Schema::dropIfExists('stock_movements');
        Schema::dropIfExists('products');
        Schema::dropIfExists('brands');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('currencies');
        Schema::dropIfExists('units');
        Schema::dropIfExists('system_settings');
    }
};
