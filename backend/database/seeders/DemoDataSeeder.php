<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Unit;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        // Categories
        $categories = [
            ['name' => 'مشروبات', 'description' => 'جميع أنواع المشروبات'],
            ['name' => 'أطعمة', 'description' => 'المواد الغذائية'],
            ['name' => 'منظفات', 'description' => 'مواد التنظيف'],
            ['name' => 'عناية شخصية', 'description' => 'منتجات العناية الشخصية'],
            ['name' => 'قرطاسية', 'description' => 'الأدوات المكتبية'],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(['name' => $category['name']], $category);
        }

        // Brands
        $brands = [
            ['name' => 'العربية', 'description' => 'منتجات عربية'],
            ['name' => 'الوطنية', 'description' => 'منتجات وطنية'],
            ['name' => 'الفاخرة', 'description' => 'منتجات فاخرة'],
        ];

        foreach ($brands as $brand) {
            Brand::firstOrCreate(['name' => $brand['name']], $brand);
        }

        // Units
        $units = [
            ['name' => 'قطعة', 'abbreviation' => 'PCS'],
            ['name' => 'كرتون', 'abbreviation' => 'CTN'],
            ['name' => 'كيلو', 'abbreviation' => 'KG'],
            ['name' => 'لتر', 'abbreviation' => 'L'],
            ['name' => 'علبة', 'abbreviation' => 'BOX'],
        ];

        foreach ($units as $unit) {
            Unit::firstOrCreate(['name' => $unit['name']], $unit);
        }

        $this->command->info('✅ تم إضافة البيانات التجريبية بنجاح!');
    }
}
