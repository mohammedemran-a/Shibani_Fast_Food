<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ProductController extends Controller
{
    /**
     * ✅ دالة قائمة المنتجات الرئيسية (تم جعلها متوافقة تمامًا مع الواجهة الأمامية).
     */
    public function index(Request $request)
    {
        // بناء الاستعلام مع العلاقات المطلوبة من الواجهة الأمامية
        $query = Product::with(['category', 'brand', 'stockBatches', 'barcodes']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('sku', 'like', "%$search%")
                  ->orWhereHas('barcodes', function($barcodeQuery) use ($search) {
                      $barcodeQuery->where('barcode', 'like', "%$search%");
                  });
            });
        }

        if ($request->has('category_id') && $request->category_id !== 'all') {
            $query->where('category_id', $request->category_id);
        }
        if ($request->has('brand_id')) {
            $query->where('brand_id', $request->brand_id);
        }
        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        // ✅ الحل الجذري والنهائي: استخدام get() وإرجاع استجابة JSON متوافقة.
        // الواجهة الأمامية لا تستخدم paginate، لذا نستخدم get() لجلب كل النتائج.
        $products = $query->latest()->get();

        // الواجهة الأمامية تتوقع بنية { data: { data: [...] } }
        // لذا نلف الاستجابة بهذا الشكل لضمان التوافق التام.
        return response()->json(['data' => ['data' => $products]]);
    }

    /**
     * ✅ دالة جديدة ومخصصة لنقطة البيع فقط (لا تغيير هنا).
     */
    public function getPosProducts(Request $request)
    {
        $query = Product::with(['barcodes', 'stockBatches'])
            ->where('is_active', true);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhereHas('barcodes', function($barcodeQuery) use ($search) {
                      $barcodeQuery->where('barcode', 'like', "%$search%");
                  });
            });
        }

        if ($request->has('category_id') && $request->category_id !== 'all') {
            $query->where('category_id', $request->category_id);
        }

        $products = $query->latest()->get();

        $transformedProducts = $products->map(function ($product) {
            return $this->transformProductForPos($product);
        });

        return response()->json(['success' => true, 'data' => $transformedProducts]);
    }

    /**
     * ✅ دالة عرض منتج واحد (لا تغيير هنا).
     */
    public function show(string $id)
    {
        $product = Product::with(['category', 'brand', 'stockBatches', 'barcodes'])->find($id);

        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Product not found'], 404);
        }
        
        if (request()->boolean('pos')) {
            $productData = $this->transformProductForPos($product);
            return response()->json(['success' => true, 'data' => $productData]);
        }

        return response()->json(['success' => true, 'data' => $product]);
    }

    /**
     * ✅ دالة مركزية ومحسّنة لتحويل بيانات المنتج (مع إصلاح منطق السعر).
     */
    protected function transformProductForPos(Product $product): array
    {
        $totalStock = $product->stockBatches()->sum('quantity_remaining');
        
        $baseUnit = $product->barcodes->firstWhere('is_base_unit', true);
        $basePrice = $baseUnit ? (float) $baseUnit->selling_price : 0;

        $sellableUnits = $product->barcodes->map(function ($barcode) use ($totalStock, $basePrice) {
            $price = (float) $barcode->selling_price;
            
            if ($price <= 0 && $basePrice > 0) {
                $price = $basePrice * (float) $barcode->unit_quantity;
            }

            return [
                'barcode_id' => $barcode->id,
                'unit_name' => $barcode->unit_name,
                'selling_price' => $price,
                'conversion_factor' => (float) $barcode->unit_quantity,
                'barcode' => $barcode->barcode,
                'stock_in_this_unit' => $barcode->unit_quantity > 0 ? floor($totalStock / $barcode->unit_quantity) : 0,
            ];
        });

        return [
            'id' => $product->id,
            'name' => $product->name,
            'image_url' => $product->image_url,
            'total_stock_in_base_units' => (float) $totalStock,
            'sellable_units' => $sellableUnits,
        ];
    }

    // ... (بقية دوال المتحكم store, update, destroy, downloadTemplate تبقى كما هي دون أي تغيير)
    public function store(StoreProductRequest $request)
    {
        $validated = $request->validated();
        try {
            $product = DB::transaction(function () use ($validated, $request) {
                $product = Product::create(['name' => $validated['name'], 'category_id' => $validated['category_id'], 'brand_id' => $validated['brand_id'] ?? null, 'product_type' => $validated['product_type'], 'description' => $validated['description'] ?? null, 'sku' => $validated['sku'] ?? ('PRD-' . time() . rand(100, 999)), 'reorder_level' => $validated['reorder_level'] ?? 0, 'is_active' => $validated['is_active'] ?? true,]);
                if ($request->hasFile('image')) {
                    $path = $request->file('image')->store('products', 'public');
                    $product->image_path = $path;
                    $product->save();
                }
                $product->barcodes()->create(['barcode' => $validated['base_unit']['barcode'] ?? ('PROD-' . $product->id), 'unit_name' => $validated['base_unit']['name'], 'unit_quantity' => 1, 'selling_price' => $validated['base_selling_price'], 'is_base_unit' => true,]);
                if (!empty($validated['additional_units'])) {
                    foreach ($validated['additional_units'] as $unit) {
                        $product->barcodes()->create(['barcode' => $unit['barcode'], 'unit_name' => $unit['name'], 'unit_quantity' => $unit['conversion_factor'], 'selling_price' => $unit['selling_price'] ?? null, 'is_base_unit' => false,]);
                    }
                }
                if (isset($validated['initial_batch']['quantity']) && $validated['initial_batch']['quantity'] > 0) {
                    $product->stockBatches()->create(['quantity_received' => $validated['initial_batch']['quantity'], 'quantity_remaining' => $validated['initial_batch']['quantity'], 'purchase_price_per_unit' => $validated['initial_batch']['cost_price'], 'expiry_date' => $validated['initial_batch']['expiry_date'] ?? null, 'notes' => 'الدفعة الأولية عند إنشاء المنتج',]);
                }
                return $product;
            });
            $product->load(['category', 'brand', 'barcodes', 'stockBatches']);
            return response()->json(['success' => true, 'message' => 'تم إنشاء المنتج بنجاح.', 'data' => $product,], 201);
        } catch (\Throwable $e) {
            Log::error("خطأ في إنشاء المنتج: " . $e->getMessage() . " في الملف: " . $e->getFile() . " على السطر: " . $e->getLine());
            return response()->json(['success' => false, 'message' => 'فشل في إنشاء المنتج. يرجى مراجعة السجلات.', 'error' => $e->getMessage(),], 500);
        }
    }
          /**
     * ✅ ===================================================================
     * ✅ دالة التحديث (تمت إعادة كتابتها بالكامل لتكون قوية وموثوقة)
     * ✅ ===================================================================
     */
    public function update(UpdateProductRequest $request, Product $product) // ✅ الحل: استخدام UpdateProductRequest
    {
        $validated = $request->validated();

        try {
            DB::transaction(function () use ($product, $validated, $request) {
                // 1. تحديث الحقول الأساسية للمنتج
                $product->update([
                    'name' => $validated['name'],
                    'category_id' => $validated['category_id'],
                    'brand_id' => $validated['brand_id'] ?? null,
                    'product_type' => $validated['product_type'],
                    'description' => $validated['description'] ?? null,
                    'sku' => $validated['sku'] ?? $product->sku,
                    'reorder_level' => $validated['reorder_level'] ?? 0,
                    'is_active' => $validated['is_active'] ?? true,
                ]);

                // 2. تحديث الصورة إذا تم إرسال صورة جديدة
                if ($request->hasFile('image')) {
                    if ($product->image_path && Storage::disk('public')->exists($product->image_path)) {
                        Storage::disk('public')->delete($product->image_path);
                    }
                    $product->image_path = $request->file('image')->store('products', 'public');
                    $product->save();
                }

                // 3. تحديث الوحدة الأساسية (باستخدام updateOrCreate لضمان وجودها)
                $product->barcodes()->updateOrCreate(
                    ['is_base_unit' => true],
                    [
                        'barcode' => $validated['base_unit']['barcode'] ?? ('PROD-' . $product->id),
                        'unit_name' => $validated['base_unit']['name'],
                        'unit_quantity' => 1,
                        'selling_price' => $validated['base_selling_price'],
                    ]
                );

                // 4. تحديث الوحدات الإضافية (منطق ذكي: حذف القديم، تحديث الموجود، إضافة الجديد)
                $incomingUnitIds = collect($validated['additional_units'] ?? [])->pluck('id')->filter();
                
                // حذف الوحدات التي لم تعد موجودة
                $product->barcodes()->where('is_base_unit', false)->whereNotIn('id', $incomingUnitIds)->delete();

                // تحديث أو إنشاء الوحدات الإضافية
                if (!empty($validated['additional_units'])) {
                    foreach ($validated['additional_units'] as $unit) {
                        $product->barcodes()->updateOrCreate(
                            ['id' => $unit['id'] ?? null], // البحث بالـ ID
                            [
                                'barcode' => $unit['barcode'],
                                'unit_name' => $unit['name'],
                                'unit_quantity' => $unit['conversion_factor'],
                                'selling_price' => $unit['selling_price'] ?? null,
                                'is_base_unit' => false,
                            ]
                        );
                    }
                }
            });

            return response()->json([
                'success' => true,
                'message' => 'تم تحديث المنتج بنجاح.',
                'data' => $product->fresh()->load(['category', 'brand', 'barcodes', 'stockBatches']),
            ]);

        } catch (\Exception $e) {
            Log::error('فشل في تحديث المنتج: ' . $e->getMessage() . ' في الملف: ' . $e->getFile() . ' على السطر: ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء تحديث المنتج.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    public function destroy(Product $product)
    {
        if ($product->salesInvoiceItems()->exists()) {
            return response()->json(['success' => false, 'message' => 'Cannot delete product. It is associated with existing sales invoices. You can deactivate it instead.',], 422);
        }
        DB::beginTransaction();
        try {
            if ($product->image_path && Storage::disk('public')->exists($product->image_path)) {
                Storage::disk('public')->delete($product->image_path);
            }
            $product->delete();
            DB::commit();
            return response()->json(['success' => true, 'message' => 'Product deleted successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Product Deletion Failed: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'An error occurred while deleting the product.',], 500);
        }
    }
    public function downloadTemplate(): StreamedResponse
    {
        $fileName = 'قالب_استيراد_المنتجات.csv';
        $internalHeaders = ['name', 'category_name', 'brand_name', 'product_type', 'description', 'sku', 'base_unit_name', 'base_unit_barcode', 'base_selling_price', 'initial_batch_quantity', 'initial_batch_cost_price', 'initial_batch_expiry_date', 'additional_unit_1_name', 'additional_unit_1_factor', 'additional_unit_1_barcode', 'additional_unit_1_price', 'additional_unit_2_name', 'additional_unit_2_factor', 'additional_unit_2_barcode', 'additional_unit_2_price',];
        $publicHeaders = ['اسم المنتج (إلزامي)', 'اسم الفئة (إلزامي)', 'اسم الماركة', 'نوع المنتج (Standard أو Weighted)', 'وصف المنتج', 'رمز SKU', 'اسم الوحدة الأساسية (إلزامي)', 'باركود الوحدة الأساسية', 'سعر بيع الوحدة الأساسية (إلزامي)', 'الكمية الأولية', 'تكلفة الشراء الأولية', 'تاريخ الصلاحية الأولي (YYYY-MM-DD)', 'اسم الوحدة الإضافية 1', 'معامل تحويل الوحدة 1', 'باركود الوحدة 1', 'سعر بيع خاص للوحدة 1', 'اسم الوحدة الإضافية 2', 'معامل تحويل الوحدة 2', 'باركود الوحدة 2', 'سعر بيع خاص للوحدة 2',];
        $sampleData = [['name' => 'مياه نوفا (قارورة)', 'category_name' => 'مشروبات باردة', 'brand_name' => 'نوفا', 'product_type' => 'Standard', 'description' => 'مياه شرب معبأة', 'sku' => 'NOV-WAT-500', 'base_unit_name' => 'قارورة', 'base_unit_barcode' => '6281011100011', 'base_selling_price' => 1, 'initial_batch_quantity' => 480, 'initial_batch_cost_price' => 0.6, 'initial_batch_expiry_date' => '2028-01-01', 'additional_unit_1_name' => 'كرتونة', 'additional_unit_1_factor' => 24, 'additional_unit_1_barcode' => '6281011100012', 'additional_unit_1_price' => 22], ['name' => 'بيبسي (علبة)', 'category_name' => 'مشروبات غازية', 'brand_name' => 'بيبسي', 'product_type' => 'Standard', 'description' => '330 مل', 'sku' => 'PEP-CAN-330', 'base_unit_name' => 'علبة', 'base_unit_barcode' => '6291002123456', 'base_selling_price' => 2.5, 'initial_batch_quantity' => 120, 'initial_batch_cost_price' => 1.75, 'initial_batch_expiry_date' => '', 'additional_unit_1_name' => 'ربطة', 'additional_unit_1_factor' => 6, 'additional_unit_1_barcode' => '6291002123457', 'additional_unit_1_price' => 14],];
        return new StreamedResponse(function () use ($internalHeaders, $publicHeaders, $sampleData) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));
            fputcsv($handle, $publicHeaders);
            foreach ($sampleData as $row) {
                $orderedRow = [];
                foreach ($internalHeaders as $header) {
                    $orderedRow[] = $row[$header] ?? '';
                }
                fputcsv($handle, $orderedRow);
            }
            fclose($handle);
        }, 200, ['Content-Type' => 'text/csv; charset=utf-8', 'Content-Disposition' => 'attachment; filename="' . rawurlencode($fileName) . '"',]);
    }
    // app/Http/Controllers/Api/ProductController.php
public function updateStatus(Request $request, Product $product)
{
    $validated = $request->validate([
        'is_active' => 'required|boolean',
    ]);

    $product->is_active = $validated['is_active'];
    $product->save();

    return response()->json([
        'success' => true,
        'message' => 'تم تحديث حالة المنتج بنجاح.',
        'data' => $product,
    ]);
}

}
