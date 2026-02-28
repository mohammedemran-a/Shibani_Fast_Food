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
    public function update(UpdateProductRequest $request, Product $product)
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
                    // ✅ الحل: استخدام اسم الحقل الصحيح 'image'
                    if ($product->image && Storage::disk('public')->exists($product->image)) {
                        Storage::disk('public')->delete($product->image);
                    }
                    // ✅ الحل: استخدام اسم الحقل الصحيح 'image'
                    $product->image = $request->file('image')->store('products', 'public');
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
    /**
     * ✅ ===================================================================
     * ✅ الحل: دالة حذف قوية وموثوقة
     * ✅ ===================================================================
     */
    public function destroy(Product $product)
    {
        // 1. التحقق من وجود المنتج في فواتير البيع
        if ($product->salesInvoiceItems()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن حذف المنتج لأنه مرتبط بفواتير بيع حالية. يمكنك إلغاء تفعيله بدلاً من ذلك.',
            ], 422);
        }

        DB::beginTransaction();
        try {
            // 2. حذف الصورة المرتبطة بالمنتج إذا كانت موجودة
            if ($product->image && Storage::disk('public')->exists($product->image)) {
                Storage::disk('public')->delete($product->image);
            }
            
            // 3. حذف المنتج (سيتم حذف العلاقات المرتبطة به تلقائيًا بفضل onDelete('cascade'))
            $product->delete();

            DB::commit();

            return response()->json(['success' => true, 'message' => 'تم حذف المنتج بنجاح.']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('فشل في حذف المنتج: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء حذف المنتج.',
            ], 500);
        }
    }


}
