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
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->onDelete('cascade');
            
            // نوع الحركة: in (دخول), out (خروج), adjustment (تعديل)
            $table->string('type'); 
            
            $table->decimal('quantity', 10, 2); // الكمية التي تحركت
            $table->decimal('cost_per_unit', 10, 2)->nullable(); // تكلفة الوحدة لهذه الحركة
            
            // مصدر الحركة (فاتورة شراء، استهلاك، تالف)
            $table->string('source_type')->nullable(); 
            $table->unsignedBigInteger('source_id')->nullable();
            
            $table->text('notes')->nullable(); // ملاحظات
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
