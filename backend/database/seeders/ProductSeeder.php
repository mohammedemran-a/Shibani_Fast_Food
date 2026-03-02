<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Modifier;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // --- 1. إنشاء الفئات ---
        $sandwichCategory = Category::firstOrCreate(['name' => 'ساندويتشات']);
        $drinksCategory = Category::firstOrCreate(['name' => 'مشروبات']);

        // --- 2. إنشاء الإضافات ---
        $extraCheese = Modifier::firstOrCreate(['name' => 'جبنة إضافية'], ['price' => 2.00]);
        $spicySauce = Modifier::firstOrCreate(['name' => 'صوص حار'], ['price' => 1.50]);

        // --- 3. إنشاء المواد الخام (Raw Materials) ---
        $beef = Product::firstOrCreate(
            ['name' => 'لحم بقري مفروم'],
            [
                'type' => 'RawMaterial',
                'unit' => 'kg',
                'stock' => 50, // رصيد افتتاحي
                'cost' => 45.00, // متوسط تكلفة الكيلو
                'reorder_level' => 10,
            ]
        );

        $bread = Product::firstOrCreate(
            ['name' => 'خبز برجر'],
            [
                'type' => 'RawMaterial',
                'unit' => 'piece',
                'stock' => 200,
                'cost' => 1.00,
                'reorder_level' => 50,
            ]
        );

        $pepsiCan = Product::firstOrCreate(
            ['name' => 'علبة بيبسي'],
            [
                'type' => 'RawMaterial',
                'unit' => 'piece',
                'stock' => 100,
                'cost' => 1.50,
                'reorder_level' => 24,
            ]
        );

        // --- 4. إنشاء الوجبات القابلة للبيع (Sellable Products) ---
        
        // وجبة برجر لحم
        $beefBurger = Product::firstOrCreate(
            ['name' => 'برجر لحم'],
            [
                'type' => 'Sellable',
                'price' => 25.00,
                'category_id' => $sandwichCategory->id,
                'is_active' => true,
            ]
        );

        // مشروب بيبسي
        $pepsiDrink = Product::firstOrCreate(
            ['name' => 'بيبسي'],
            [
                'type' => 'Sellable',
                'price' => 3.00,
                'category_id' => $drinksCategory->id,
                'is_active' => true,
            ]
        );

        // --- 5. بناء الوصفات المعيارية (ربط الوجبات بالمكونات) ---
        
        // وصفة برجر اللحم
        $beefBurger->ingredients()->sync([
            $beef->id => ['quantity' => 0.150], // 150 جرام لحم
            $bread->id => ['quantity' => 1],     // 1 قطعة خبز
        ]);

        // وصفة مشروب البيبسي
        $pepsiDrink->ingredients()->sync([
            $pepsiCan->id => ['quantity' => 1], // 1 علبة بيبسي
        ]);

        // --- 6. ربط الإضافات المتاحة بالوجبات ---
        $beefBurger->availableModifiers()->sync([$extraCheese->id, $spicySauce->id]);

        // --- 7. حساب تكلفة الوجبات بناءً على وصفاتها ---
        $this->calculateSellableProductsCost();

        $this->command->info('✅ تم إضافة بيانات المنتجات والوصفات بنجاح!');
    }

    /**
     * دالة لحساب وتحديث تكلفة كل المنتجات القابلة للبيع.
     */
    private function calculateSellableProductsCost(): void
    {
        $sellableProducts = Product::where('type', 'Sellable')->with('ingredients')->get();

        foreach ($sellableProducts as $product) {
            $totalCost = 0;
            foreach ($product->ingredients as $ingredient) {
                // تكلفة المكون = كميته في الوصفة * متوسط تكلفة المكون
                $totalCost += $ingredient->pivot->quantity * $ingredient->cost;
            }
            $product->cost = $totalCost;
            $product->save();
        }
    }
}
