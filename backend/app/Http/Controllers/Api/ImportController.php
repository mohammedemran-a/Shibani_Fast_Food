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
            $csv = array_map('str_getcsv', file($path));
            
            // Get headers
            $headers = array_shift($csv);
            
            $imported = 0;
            $errors = [];
            
            DB::beginTransaction();
            
            foreach ($csv as $index => $row) {
                try {
                    // Skip empty rows
                    if (empty(array_filter($row))) {
                        continue;
                    }
                    
                    // Map CSV row to array
                    $data = array_combine($headers, $row);
                    
                    // Get or create category (using 'category' field)
                    $categoryName = $data['category'] ?? null;
                    if (empty($categoryName)) {
                        throw new \Exception('Category is required');
                    }
                    $category = $this->getOrCreateCategory($categoryName);
                    
                    // Get or create brand (optional, using 'brand' field)
                    $brandName = $data['brand'] ?? null;
                    $brand = !empty($brandName) ? $this->getOrCreateBrand($brandName) : null;
                    
                    // Get or create unit (using 'unit' field)
                    $unitName = $data['unit'] ?? null;
                    if (empty($unitName)) {
                        throw new \Exception('Unit is required');
                    }
                    $unit = $this->getOrCreateUnit($unitName);
                    
                    // Create product
                    Product::create([
                        'name' => $data['name'],
                        'sku' => $data['sku'],
                        'barcode' => $data['barcode'],
                        'category_id' => $category->id,
                        'brand_id' => $brand?->id,
                        'unit_id' => $unit->id,
                        'purchase_price' => $data['purchase_price'],
                        'selling_price' => $data['selling_price'],
                        'quantity' => $data['quantity'] ?? 0,
                        'reorder_level' => $data['reorder_level'] ?? 10,
                        'description' => $data['description'] ?? null,
                        'expiry_date' => !empty($data['expiry_date']) ? $data['expiry_date'] : null,
                    ]);
                    
                    $imported++;
                    
                } catch (\Exception $e) {
                    $errors[] = "Row " . ($index + 2) . ": " . $e->getMessage();
                    Log::error("Import error on row " . ($index + 2), [
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
        // Try to find by name (English or Arabic)
        $category = Category::where('name', $name)
            ->first();
        
        if ($category) {
            return $category;
        }
        
        // Create new category
        return Category::create([
            'name' => $name,
        ]);
    }
    
    /**
     * Get or create brand by name
     */
    private function getOrCreateBrand(string $name)
    {
        // Try to find by name (English or Arabic)
        $brand = Brand::where('name', $name)
            ->first();
        
        if ($brand) {
            return $brand;
        }
        
        // Create new brand
        return Brand::create([
            'name' => $name,
        ]);
    }
    
    /**
     * Get or create unit by name
     */
    private function getOrCreateUnit(string $name)
    {
        // Try to find by name or abbreviation
        $unit = Unit::where('name', $name)
            ->orWhere('abbreviation', $name)
            ->first();
        
        if ($unit) {
            return $unit;
        }
        
        // Create new unit with auto-generated abbreviation
        // Use first 3 letters or generate from hash to avoid encoding issues
        $abbr = preg_match('/^[a-zA-Z]/', $name) 
            ? strtolower(substr($name, 0, 3)) 
            : 'u' . substr(md5($name), 0, 2);
        
        return Unit::create([
            'name' => $name,
            'abbreviation' => $abbr,
        ]);
    }
}
