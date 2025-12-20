<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * جدول العلامات التجارية (Brands)
     * يحتوي على العلامات التجارية للمنتجات
     */
    public function up(): void
    {
        Schema::create('brands', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // اسم العلامة التجارية (يمكن أن يكون عربي أو إنجليزي)
            $table->text('description')->nullable(); // وصف العلامة التجارية
            $table->string('logo')->nullable(); // شعار العلامة التجارية
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('brands');
    }
};
