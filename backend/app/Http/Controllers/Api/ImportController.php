<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ImportController extends Controller
{
    /**
     * Import products from CSV
     */
    public function importProducts(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt',
        ]);

        try {
            $file = $request->file('file');
            $path = $file->getRealPath();
            
            // =================================================================
            // **1. التعديل الرئيسي هنا: قراءة الملف وإزالة الـ BOM**
            // =================================================================
            $fileContent = file_get_contents($path);
            // إزالة علامة UTF-8 BOM إذا كانت موجودة في بداية الملف
            if (substr($fileContent, 0, 3) === "\xEF\xBB\xBF") {
                $fileContent = substr($fileContent, 3);
            }
            // تحويل المحتوى إلى مصفوفة من السطور ثم إلى CSV
            $csv = array_map('str_getcsv', explode("\n", $fileContent));
            
            // الحصول على العناوين من السطر الأول
            $headers = array_shift($csv);
            
            $imported = 0;
            $errors = [];
            
            DB::beginTransaction();
            
            foreach ($csv as $index => $row) {
                $rowNumber = $index + 2;

                try {
                    // تخطي الصفوف الفارغة تمامًا
                    if (count($row) === 1 && empty($row[0])) {
                        continue;
                    }
                    
                    // التأكد من تطابق عدد الأعمدة
                    if (count($headers) !== count($row)) {
                        // تجاهل الصفوف التي لا تتطابق مع عدد الأعمدة (قد تكون سطور فارغة في نهاية الملف)
                        continue;
                    }

                    $data = array_combine($headers, $row);
                    
                    $categoryName = $data['category_name'] ?? null;
                    $brandName = $data['brand_name'] ?? null;
                    $unitName = $data['unit_name'] ?? null;

                    if (empty($data['name'])) {
                        throw new \Exception('Product name is required');
                    }
                    if (empty($categoryName)) {
                        throw new \Exception('Category name is required');
                    }
                    if (empty($unitName)) {
                        throw new \Exception('Unit name is required');
                    }
                    
                    $category = $this->getOrCreateCategory($categoryName);
                    $brand = !empty($brandName) ? $this->getOrCreateBrand($brandName) : null;
                    $unit = $this->getOrCreateUnit($unitName);
                    
                    Product::create([
                        'name' => $data['name'],
                        'sku' => $data['sku'] ?? 'PRD-' . time() . rand(100, 999),
                        'barcode' => $data['barcode'] ?? null,
                        'category_id' => $category->id,
                        'brand_id' => $brand?->id,
                        'unit_id' => $unit->id,
                        'purchase_price' => $data['purchase_price'] ?? 0,
                        'selling_price' => $data['selling_price'] ?? 0,
                        'quantity' => $data['quantity'] ?? 0,
                        'reorder_level' => $data['reorder_level'] ?? 10,
                        'description' => $data['description'] ?? null,
                        'expiry_date' => !empty($data['expiry_date']) ? $data['expiry_date'] : null,
                        'is_active' => true,
                    ]);
                    
                    $imported++;
                    
                } catch (\Exception $e) {
                    $errors[] = "Row " . $rowNumber . ": " . $e->getMessage();
                    Log::error("Import error on row " . $rowNumber, [
                        'error' => $e->getMessage(),
                        'data' => $row
                    ]);
                }
            }
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => "تم استيراد {$imported} منتج بنجاح",
                'imported' => $imported,
                'errors' => $errors,
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'فشل في استيراد المنتجات: ' . $e->getMessage(),
            ], 500);
        }
    }
    
    /**
     * Get or create category by name
     */
    private function getOrCreateCategory(string $name)
    {
        return Category::firstOrCreate(['name' => trim($name)]);
    }
    
    /**
     * Get or create brand by name
     */
    private function getOrCreateBrand(string $name)
    {
        return Brand::firstOrCreate(['name' => trim($name)]);
    }
    
    /**
     * Get or create unit by name
     */
    private function getOrCreateUnit(string $name)
    {
        $trimmedName = trim($name);
        
        $unit = Unit::where('name', $trimmedName)
            ->orWhere('abbreviation', $trimmedName)
            ->first();
        
        if ($unit) {
            return $unit;
        }
        
        $abbr = preg_match('/^[a-zA-Z]/', $trimmedName) 
            ? strtolower(substr($trimmedName, 0, 3)) 
            : 'u' . substr(md5($trimmedName), 0, 2);
        
        return Unit::create([
            'name' => $trimmedName,
            'abbreviation' => $abbr,
        ]);
    }
}
