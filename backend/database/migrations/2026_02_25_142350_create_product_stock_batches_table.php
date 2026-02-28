<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::create('product_stock_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->foreignId('purchase_invoice_item_id')->nullable()->constrained('purchase_invoice_items')->onDelete('set null');
            $table->decimal('quantity_received', 10, 2);
            $table->decimal('quantity_remaining', 10, 2);
            $table->decimal('purchase_price_per_unit', 12, 4);
            $table->date('expiry_date')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('product_stock_batches');
    }
};
