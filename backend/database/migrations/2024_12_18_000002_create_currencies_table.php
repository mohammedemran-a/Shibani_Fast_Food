<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * جدول العملات (Currencies)
     * يحتوي على العملات المستخدمة في النظام
     */
    public function up(): void
    {
        Schema::create('currencies', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // اسم العملة (يمكن أن يكون عربي أو إنجليزي)
            $table->string('code')->unique(); // رمز العملة (USD, SAR, EGP)
            $table->string('symbol'); // رمز العملة ($, ريال, جنيه)
            $table->decimal('exchange_rate', 10, 4)->default(1); // سعر الصرف
            $table->boolean('is_default')->default(false); // العملة الافتراضية
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('currencies');
    }
};
