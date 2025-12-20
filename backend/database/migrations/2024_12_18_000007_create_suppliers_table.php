<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * جدول الموردين (Suppliers)
     * يحتوي على معلومات الموردين
     */
    public function up(): void
    {
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // اسم المورد (يمكن أن يكون عربي أو إنجليزي)
            $table->string('email')->nullable(); // البريد الإلكتروني
            $table->string('phone'); // رقم الهاتف
            $table->string('address')->nullable(); // العنوان
            $table->string('city')->nullable(); // المدينة
            $table->string('country')->nullable(); // الدولة
            $table->text('notes')->nullable(); // ملاحظات
            $table->boolean('is_active')->default(true); // حالة المورد (مفعل/غير مفعل)
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('suppliers');
    }
};
