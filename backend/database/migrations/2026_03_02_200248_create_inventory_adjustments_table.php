<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * جدول تسويات المخزون (Inventory Adjustments).
     * 
     * يسجل عمليات الجرد والتسوية اليدوية للمخزون،
     * ويوثق أي هدر (Wastage) أو فائض (Surplus) في المواد الخام.
     */
    public function up(): void
    {
        Schema::create('inventory_adjustments', function (Blueprint $table) {
            $table->id();
            
            // المادة الخام التي تم تسويتها
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');

            // نوع التسوية: هدر أم فائض؟
            $table->enum('type', ['Wastage', 'Surplus']);

            // الكمية التي تمثل الفرق (دائماً قيمة موجبة)
            $table->decimal('quantity', 12, 3);

            // سبب التسوية (مثال: "جرد نهاية اليوم"، "تلف بضاعة")
            $table->string('reason')->nullable();

            // الموظف الذي قام بعملية الجرد والتسوية
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            
            $table->timestamps();
        });
    }

    /**
     * التراجع عن ملفات الهجرة.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_adjustments');
    }
};
