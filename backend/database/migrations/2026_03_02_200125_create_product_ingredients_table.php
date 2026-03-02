<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * جدول مكونات المنتج (Product Ingredients) - الوصفات المعيارية.
     * 
     * جدول محوري يربط المنتجات القابلة للبيع (الوجبات) بالمواد الخام التي تتكون منها،
     * مع تحديد الكمية المعيارية لكل مكون.
     */
    public function up(): void
    {
        Schema::create('product_ingredients', function (Blueprint $table) {
            $table->id();
            
            // مفتاح خارجي للوجبة (المنتج القابل للبيع)
            $table->foreignId('sellable_product_id')->constrained('products')->onDelete('cascade');

            // مفتاح خارجي للمكون (المادة الخام)
            $table->foreignId('raw_material_product_id')->constrained('products')->onDelete('cascade');

            // الكمية المعيارية المستخدمة من المادة الخام في هذه الوصفة
            $table->decimal('quantity', 12, 4);

            // إنشاء مفتاح فريد مركب لمنع تكرار نفس المكون في نفس الوصفة
            $table->unique(['sellable_product_id', 'raw_material_product_id'], 'product_ingredient_unique');
        });
    }

    /**
     * التراجع عن ملفات الهجرة.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_ingredients');
    }
};
