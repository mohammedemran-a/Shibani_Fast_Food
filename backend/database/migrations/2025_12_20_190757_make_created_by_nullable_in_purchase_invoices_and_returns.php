<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * جعل عمود created_by قابل للقيمة null في جداول purchase_invoices و returns
     * لأن المستخدم قد لا يكون مسجل دخول في بعض الحالات
     */
    public function up(): void
    {
        Schema::table('purchase_invoices', function (Blueprint $table) {
            $table->foreignId('created_by')->nullable()->change();
        });

        Schema::table('returns', function (Blueprint $table) {
            $table->foreignId('created_by')->nullable()->change();
        });
    }

    /**
     * التراجع عن التغييرات
     */
    public function down(): void
    {
        Schema::table('purchase_invoices', function (Blueprint $table) {
            $table->foreignId('created_by')->nullable(false)->change();
        });

        Schema::table('returns', function (Blueprint $table) {
            $table->foreignId('created_by')->nullable(false)->change();
        });
    }
};
