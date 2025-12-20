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
        Schema::table('purchase_invoices', function (Blueprint $table) {
            // إضافة المجموع الفرعي (قبل الضريبة والخصم)
            $table->decimal('subtotal', 10, 2)->default(0)->after('invoice_date');
            
            // إضافة قيمة الضريبة
            $table->decimal('tax_amount', 10, 2)->default(0)->after('subtotal');
            
            // إضافة قيمة الخصم
            $table->decimal('discount_amount', 10, 2)->default(0)->after('tax_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchase_invoices', function (Blueprint $table) {
            $table->dropColumn(['subtotal', 'tax_amount', 'discount_amount']);
        });
    }
};
