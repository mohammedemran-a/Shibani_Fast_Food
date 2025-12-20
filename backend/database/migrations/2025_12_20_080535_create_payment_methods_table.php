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
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // اسم طريقة الدفع (يمكن عربي أو إنجليزي)
            $table->string('icon')->default('💳'); // أيقونة طريقة الدفع
            $table->boolean('is_active')->default(true); // مفعل/غير مفعل
            $table->timestamps();
        });

        // إضافة بيانات افتراضية
        DB::table('payment_methods')->insert([
            ['name' => 'STC Pay', 'icon' => '📱', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'UrPay', 'icon' => '💳', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Apple Pay', 'icon' => '🍎', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'تحويل بنكي', 'icon' => '🏦', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'مدى', 'icon' => '💚', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_methods');
    }
};
