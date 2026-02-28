<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ImportController extends Controller
{
    /**
     * استيراد المنتجات من ملف CSV (النسخة النهائية).
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function importProducts(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:csv,txt']);

        try {
            $file = $request->file('file');
            $path = $file->getRealPath();
            
            $fileContent = file_get_contents($path);
            // إزالة علامة UTF-8 BOM إذا كانت موجودة
            if (substr($fileContent, 0, 3) === "\xEF\xBB\xBF") {
                $fileContent = substr($fileContent, 3);
            }
            
            $csv = array_map('str_getcsv', explode("\n", trim($fileContent)));
            $headers = array_shift($csv);
            
            $importedCount = 0;
            $errorMessages = [];
            
            // استخدام Transaction لضمان سلامة البيانات
            DB::transaction(function () use ($csv, $headers, &$importedCount, &$errorMessages) {
                foreach ($csv as $index => $row) {
                    $rowNumber = $index + 2;

                    // تخطي الصفوف الفارغة تمامًا
                    if (count($row) === 1 && empty($row[0])) {
                        continue;
                    }
                    
                    // التأكد من أن الصف يحتوي على بيانات كافية
                    if (count($headers) > count($row)) {
                        $row = array_pad($row, count($headers), ''); // ملء الأعمدة المفقودة بقيم فارغة
                    }
                    
                    $data = array_combine($headers, $row);

                    try {
                        // 1. تحويل البيانات من الشكل المسطح إلى الشكل المتداخل
                        $productData = $this->transformRowToProductData($data);

                        // 2. التحقق من صحة البيانات باستخدام نفس قواعد الفورم
                        $validator = Validator::make($productData, (new StoreProductRequest())->rules());
                        if ($validator->fails()) {
                            throw new \Exception(implode(', ', $validator->errors()->all()));
                        }
                        $validatedData = $validator->validated();

                        // 3. إنشاء المنتج والعلاقات المرتبطة به
                        $this->createProductFromData($validatedData);
                        
                        $importedCount++;
                        
                    } catch (\Exception $e) {
                        $errorMessages[] = "Row " . $rowNumber . ": " . $e->getMessage();
                        Log::error("Import error on row " . $rowNumber, ['error' => $e->getMessage(), 'data' => $data]);
                    }
                }
            });
            
            return response()->json([
                'success' => true,
                'message' => "اكتمل الاستيراد. تم استيراد {$importedCount} منتج بنجاح.",
                'imported' => $importedCount,
                'errors' => $errorMessages,
            ]);
            
        } catch (\Exception $e) {
            Log::error("Fatal import error: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'فشل في استيراد الملف: ' . $e->getMessage()], 500);
        }
    }

    /**
     * تحويل صف من CSV إلى هيكل بيانات المنتج المتداخل.
     *
     * @param array $row
     * @return array
     */
    private function transformRowToProductData(array $row): array
    {
        // إنشاء الفئة والعلامة التجارية تلقائيًا إذا لم تكن موجودة
        $category = !empty($row['category_name']) ? Category::firstOrCreate(['name' => trim($row['category_name'])]) : null;
        $brand = !empty($row['brand_name']) ? Brand::firstOrCreate(['name' => trim($row['brand_name'])]) : null;

        $productData = [
            'name' => $row['name'] ?? null,
            'category_id' => $category?->id,
            'brand_id' => $brand?->id,
            'product_type' => $row['product_type'] ?? 'Standard',
            'description' => $row['description'] ?? null,
            'sku' => $row['sku'] ?? null,
            'reorder_level' => $row['reorder_level'] ?? null,
            'is_active' => true, // المنتجات المستوردة تكون نشطة افتراضيًا
            
            'base_selling_price' => $row['base_selling_price'] ?? null,
            
            'base_unit' => [
                'name' => $row['base_unit_name'] ?? null,
                'barcode' => $row['base_unit_barcode'] ?? null,
            ],
            
            'initial_batch' => [
                'quantity' => $row['initial_batch_quantity'] ?? null,
                'cost_price' => $row['initial_batch_cost_price'] ?? null,
                'expiry_date' => !empty($row['initial_batch_expiry_date']) ? $row['initial_batch_expiry_date'] : null,
            ],
            
            'additional_units' => [],
        ];

        // تجميع الوحدات الإضافية (البحث عن 5 وحدات كحد أقصى)
        for ($i = 1; $i <= 5; $i++) {
            if (!empty($row["additional_unit_{$i}_name"]) && !empty($row["additional_unit_{$i}_factor"])) {
                $productData['additional_units'][] = [
                    'name' => $row["additional_unit_{$i}_name"],
                    'conversion_factor' => $row["additional_unit_{$i}_factor"],
                    'barcode' => $row["additional_unit_{$i}_barcode"] ?? null,
                    'selling_price' => $row["additional_unit_{$i}_price"] ?? null,
                ];
            }
        }

        return $productData;
    }

    /**
     * إنشاء منتج من بيانات تم التحقق من صحتها (منطق مركزي).
     *
     * @param array $validatedData
     * @return \App\Models\Product
     */
    private function createProductFromData(array $validatedData): Product
    {
        $product = Product::create([
            'name' => $validatedData['name'],
            'category_id' => $validatedData['category_id'],
            'brand_id' => $validatedData['brand_id'] ?? null,
            'product_type' => $validatedData['product_type'],
            'description' => $validatedData['description'] ?? null,
            'sku' => $validatedData['sku'] ?? ('PRD-' . time() . rand(100, 999)),
            'reorder_level' => $validatedData['reorder_level'] ?? 0,
            'is_active' => $validatedData['is_active'] ?? true,
        ]);

        $product->barcodes()->create([
            'barcode' => $validatedData['base_unit']['barcode'],
            'unit_name' => $validatedData['base_unit']['name'],
            'unit_quantity' => 1,
            'selling_price' => $validatedData['base_selling_price'],
            'is_base_unit' => true,
        ]);

        if (!empty($validatedData['additional_units'])) {
            foreach ($validatedData['additional_units'] as $unit) {
                $product->barcodes()->create([
                    'barcode' => $unit['barcode'],
                    'unit_name' => $unit['name'],
                    'unit_quantity' => $unit['conversion_factor'],
                    'selling_price' => $unit['selling_price'] ?? null,
                    'is_base_unit' => false,
                ]);
            }
        }

        if (isset($validatedData['initial_batch']['quantity']) && $validatedData['initial_batch']['quantity'] > 0) {
            $product->stockBatches()->create([
                'quantity_received' => $validatedData['initial_batch']['quantity'],
                'quantity_remaining' => $validatedData['initial_batch']['quantity'],
                'purchase_price_per_unit' => $validatedData['initial_batch']['cost_price'],
                'expiry_date' => $validatedData['initial_batch']['expiry_date'] ?? null,
                'notes' => 'دفعة مستوردة من ملف CSV',
            ]);
        }
        
        return $product;
    }
}
