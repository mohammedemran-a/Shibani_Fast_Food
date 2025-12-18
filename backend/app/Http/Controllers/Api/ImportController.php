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
                    
                    // Get or create category
                    $category = $this->getOrCreateCategory($data);
                    
                    // Get or create brand (optional)
                    $brand = !empty($data['brand_id']) ? $this->getOrCreateBrand($data) : null;
                    
                    // Get or create unit
                    $unit = $this->getOrCreateUnit($data);
                    
                    // Create product
                    Product::create([
                        'name' => $data['name'],
                        'name_ar' => $data['name_ar'] ?? $data['name'],
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
     * Get or create category
     */
    private function getOrCreateCategory($data)
    {
        // Try to find by ID first
        if (!empty($data['category_id']) && is_numeric($data['category_id'])) {
            $category = Category::find($data['category_id']);
            if ($category) {
                return $category;
            }
        }
        
        // Try to find by name
        if (!empty($data['category_name'])) {
            $category = Category::where('name', $data['category_name'])
                ->orWhere('name_ar', $data['category_name'])
                ->first();
            
            if ($category) {
                return $category;
            }
            
            // Create new category
            return Category::create([
                'name' => $data['category_name'],
                'name_ar' => $data['category_name'],
            ]);
        }
        
        // If category_id is provided but not found, throw error
        throw new \Exception('Category not found or invalid');
    }
    
    /**
     * Get or create brand
     */
    private function getOrCreateBrand($data)
    {
        // Try to find by ID first
        if (!empty($data['brand_id']) && is_numeric($data['brand_id'])) {
            $brand = Brand::find($data['brand_id']);
            if ($brand) {
                return $brand;
            }
        }
        
        // Try to find by name
        if (!empty($data['brand_name'])) {
            $brand = Brand::where('name', $data['brand_name'])
                ->orWhere('name_ar', $data['brand_name'])
                ->first();
            
            if ($brand) {
                return $brand;
            }
            
            // Create new brand
            return Brand::create([
                'name' => $data['brand_name'],
                'name_ar' => $data['brand_name'],
            ]);
        }
        
        return null;
    }
    
    /**
     * Get or create unit
     */
    private function getOrCreateUnit($data)
    {
        // Try to find by ID first
        if (!empty($data['unit_id']) && is_numeric($data['unit_id'])) {
            $unit = Unit::find($data['unit_id']);
            if ($unit) {
                return $unit;
            }
        }
        
        // Try to find by name or abbreviation
        if (!empty($data['unit_name'])) {
            $unit = Unit::where('name', $data['unit_name'])
                ->orWhere('name_ar', $data['unit_name'])
                ->orWhere('abbreviation', $data['unit_name'])
                ->first();
            
            if ($unit) {
                return $unit;
            }
            
            // Create new unit
            return Unit::create([
                'name' => $data['unit_name'],
                'name_ar' => $data['unit_name'],
                'abbreviation' => strtolower(substr($data['unit_name'], 0, 3)),
            ]);
        }
        
        // If unit_id is provided but not found, throw error
        throw new \Exception('Unit not found or invalid');
    }
}
