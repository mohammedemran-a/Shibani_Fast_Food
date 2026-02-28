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
        // ✅ الحل الجذري: التحقق من عدم وجود العمود قبل محاولة إضافته
        if (!Schema::hasColumn('customers', 'last_purchase_at')) {
            Schema::table('customers', function (Blueprint $table) {
                $table->timestamp('last_purchase_at')->nullable()->after('loyalty_points');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // ✅ التحقق من وجود العمود قبل محاولة حذفه
        if (Schema::hasColumn('customers', 'last_purchase_at')) {
            Schema::table('customers', function (Blueprint $table) {
                $table->dropColumn('last_purchase_at');
            });
        }
    }
};
