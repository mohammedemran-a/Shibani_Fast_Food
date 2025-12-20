<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * جدول الوحدات (Units)
     * يحتوي على وحدات القياس المستخدمة للمنتجات
     */
    public function up(): void
    {
        Schema::create('units', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // اسم الوحدة (يمكن أن يكون عربي أو إنجليزي)
            $table->string('abbreviation'); // الاختصار (مثل: كجم، kg)
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('units');
    }
};
