<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * جدول جلسات الكاشير (Cashier Sessions)
     * يحتوي على جلسات عمل الكاشير
     */
    public function up(): void
    {
        Schema::create('cashier_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cashier_id')->constrained('users')->onDelete('cascade');
            $table->dateTime('start_time'); // وقت بداية الجلسة
            $table->dateTime('end_time')->nullable(); // وقت نهاية الجلسة
            $table->decimal('opening_balance', 12, 2)->default(0); // الرصيد الافتتاحي
            $table->decimal('closing_balance', 12, 2)->nullable(); // الرصيد الختامي
            $table->enum('status', ['open', 'closed'])->default('open'); // الحالة
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cashier_sessions');
    }
};
