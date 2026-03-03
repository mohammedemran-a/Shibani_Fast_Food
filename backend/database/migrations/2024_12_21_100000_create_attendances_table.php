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
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->date('date');
            $table->time('check_in')->nullable();
            $table->time('check_out')->nullable();
            $table->integer('work_hours')->nullable()->comment('عدد ساعات العمل بالدقائق');
            $table->enum('status', ['present', 'absent', 'late', 'half_day'])->default('present');
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Index for better performance
            $table->index(['employee_id', 'date']);
            $table->unique(['employee_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
