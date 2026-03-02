<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * جدول الإضافات (Modifiers).
     * 
     * يسجل جميع الخيارات الإضافية التي يمكن إضافتها للوجبات،
     * مثل "جبنة إضافية"، "حجم كبير"، "صوص حار".
     */
    public function up(): void
    {
        Schema::create('modifiers', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // اسم الإضافة (يجب أن يكون فريداً)
            $table->decimal('price', 10, 2)->default(0); // سعر الإضافة (قد يكون صفرًا لبعض الخيارات)
            $table->boolean('is_active')->default(true); // لتفعيل أو تعطيل الإضافة
            $table->timestamps();
        });
    }

    /**
     * التراجع عن ملفات الهجرة.
     */
    public function down(): void
    {
        Schema::dropIfExists('modifiers');
    }
};
