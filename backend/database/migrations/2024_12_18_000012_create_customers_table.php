<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * جدول العملاء (Customers)
     * يحتوي على معلومات العملاء
     */
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // اسم العميل (يمكن أن يكون عربي أو إنجليزي)
            $table->string('email')->nullable(); // البريد الإلكتروني
            $table->string('phone'); // رقم الهاتف
            $table->string('address')->nullable(); // العنوان
            $table->string('city')->nullable(); // المدينة
            $table->string('country')->nullable(); // الدولة
            $table->text('notes')->nullable(); // ملاحظات
            $table->decimal('loyalty_points', 10, 2)->default(0); // نقاط الولاء
            $table->boolean('is_active')->default(true); // حالة العميل (مفعل/غير مفعل)
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
