<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

/**
 * متحكم المنتجات
 * 
 * يدير جميع العمليات المتعلقة بالمنتجات (CRUD)
 * مع دعم البحث، الفلترة، والترقيم
 */
class ProductController extends Controller
{
    /**
     * عرض قائمة المنتجات مع الفلترة والبحث
     * 
     * يدعم:
     * - البحث بالاسم، SKU، أو الباركود
     * - الفلترة حسب الفئة، العلامة التجارية، وحالة التفعيل
     * - الترقيم الديناميكي أو عرض الكل
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // استعلام أساسي مع تحميل العلاقات
        $query = Product::with(['category', 'brand', 'unit']);

        // البحث في الاسم، SKU، أو الباركود
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('sku', 'like', "%$search%")
                  ->orWhere('barcode', 'like', "%$search%");
            });
        }

        // الفلترة حسب الفئة
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // الفلترة حسب العلامة التجارية
        if ($request->has('brand_id')) {
            $query->where('brand_id', $request->brand_id);
        }

        // الفلترة حسب حالة التفعيل
        // تحويل string 'true'/'false' إلى boolean 1/0
        if ($request->has('is_active')) {
            $isActive = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN);
            $query->where('is_active', $isActive);
        }

        // عرض جميع المنتجات بدون ترقيم إذا طُلب ذلك
        if ($request->has('all') && $request->all == 'true') {
            $products = $query->get();
            return response()->json([
                'success' => true,
                'data' => ['data' => $products, 'total' => $products->count()],
            ]);
        }
        
        // الترقيم الديناميكي (افتراضي: 1000 منتج لكل صفحة)
        $products = $query->paginate($request->per_page ?? 1000);

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    /**
     * إنشاء منتج جديد
     * 
     * يدعم:
     * - إنشاء الفئة، العلامة التجارية، أو الوحدة تلقائياً إذا لم تكن موجودة
     * - توليد SKU وBarcode تلقائياً
     * - رفع الصورة
     * - تفعيل المنتج افتراضياً
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // التحقق من صحة البيانات
        $validated = $request->validate([
            'name' => 'required|string',
            'sku' => 'nullable|unique:products',
            'barcode' => 'nullable|unique:products',
            'category_id' => 'nullable|exists:categories,id',
            'category_name' => 'nullable|string',
            'brand_id' => 'nullable|exists:brands,id',
            'brand_name' => 'nullable|string',
            'unit_id' => 'nullable|exists:units,id',
            'unit_name' => 'nullable|string',
            'purchase_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'quantity' => 'required|integer|min:0',
            'reorder_level' => 'integer|min:0',
            'expiry_date' => 'nullable|date',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
            'is_active' => 'boolean',
        ]);

        // معالجة الفئة - إنشاؤها إذا تم توفير الاسم
        if (!empty($validated['category_name'])) {
            $category = \App\Models\Category::firstOrCreate(
                ['name' => $validated['category_name']]
            );
            $validated['category_id'] = $category->id;
        }
        
        // معالجة العلامة التجارية - إنشاؤها إذا تم توفير الاسم
        if (!empty($validated['brand_name'])) {
            $brand = \App\Models\Brand::firstOrCreate(
                ['name' => $validated['brand_name']]
            );
            $validated['brand_id'] = $brand->id;
        }
        
        // معالجة الوحدة - إنشاؤها إذا تم توفير الاسم
        if (!empty($validated['unit_name'])) {
            // توليد اختصار للوحدة
            $abbr = preg_match('/^[a-zA-Z]/', $validated['unit_name']) 
                ? strtolower(substr($validated['unit_name'], 0, 3)) 
                : 'u' . substr(md5($validated['unit_name']), 0, 2);
            
            $unit = \App\Models\Unit::firstOrCreate(
                ['name' => $validated['unit_name']],
                ['abbreviation' => $abbr]
            );
            $validated['unit_id'] = $unit->id;
        }
        
        // التحقق من وجود الفئة (إلزامي)
        if (empty($validated['category_id'])) {
            return response()->json([
                'success' => false,
                'message' => 'Category is required',
            ], 422);
        }
        
        // التحقق من وجود الوحدة (إلزامي)
        if (empty($validated['unit_id'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unit is required',
            ], 422);
        }

        // تفعيل المنتج افتراضياً
        if (!isset($validated['is_active'])) {
            $validated['is_active'] = true;
        }
        
        // توليد SKU تلقائياً إذا لم يتم توفيره
        if (empty($validated['sku'])) {
            $validated['sku'] = 'PRD-' . time() . rand(100, 999);
        }
        
        // توليد Barcode تلقائياً إذا لم يتم توفيره
        if (empty($validated['barcode'])) {
            $validated['barcode'] = time() . rand(1000, 9999);
        }
        
        // معالجة رفع الصورة
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        // إنشاء المنتج
        $product = Product::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully',
            'data' => $product->load(['category', 'brand', 'unit']),
        ], 201);
    }

    /**
     * عرض تفاصيل منتج محدد
     * 
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(string $id)
    {
        $product = Product::with(['category', 'brand', 'unit'])->find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $product,
        ]);
    }

    /**
     * تحديث منتج موجود
     * 
     * يدعم:
     * - تحديث جميع الحقول
     * - إنشاء الفئة/العلامة/الوحدة إذا تم توفير الاسم
     * - تحديث الصورة مع حذف الصورة القديمة
     * 
     * @param Request $request
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, string $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found',
            ], 404);
        }

        // التحقق من صحة البيانات
        $validated = $request->validate([
            'name' => 'string',
            'sku' => 'unique:products,sku,' . $product->id,
            'barcode' => 'unique:products,barcode,' . $product->id,
            'category_id' => 'nullable|exists:categories,id',
            'category_name' => 'nullable|string',
            'brand_id' => 'nullable|exists:brands,id',
            'brand_name' => 'nullable|string',
            'unit_id' => 'nullable|exists:units,id',
            'unit_name' => 'nullable|string',
            'purchase_price' => 'numeric|min:0',
            'selling_price' => 'numeric|min:0',
            'quantity' => 'integer|min:0',
            'reorder_level' => 'integer|min:0',
            'expiry_date' => 'nullable|date',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:10240',
        ]);

        // معالجة الفئة بالاسم
        if (!empty($validated['category_name']) && empty($validated['category_id'])) {
            $category = \App\Models\Category::firstOrCreate(
                ['name' => $validated['category_name']],
                ['description' => '']
            );
            $validated['category_id'] = $category->id;
        }
        unset($validated['category_name']);

        // معالجة العلامة التجارية بالاسم
        if (!empty($validated['brand_name']) && empty($validated['brand_id'])) {
            $brand = \App\Models\Brand::firstOrCreate(
                ['name' => $validated['brand_name']],
                ['description' => '']
            );
            $validated['brand_id'] = $brand->id;
        }
        unset($validated['brand_name']);

        // معالجة الوحدة بالاسم
        if (!empty($validated['unit_name']) && empty($validated['unit_id'])) {
            $unit = \App\Models\Unit::firstOrCreate(
                ['name' => $validated['unit_name']],
                ['abbreviation' => mb_substr($validated['unit_name'], 0, 3)]
            );
            $validated['unit_id'] = $unit->id;
        }
        unset($validated['unit_name']);

        // معالجة رفع الصورة الجديدة
        if ($request->hasFile('image')) {
            // حذف الصورة القديمة إذا كانت موجودة
            if ($product->image && \Storage::disk('public')->exists($product->image)) {
                \Storage::disk('public')->delete($product->image);
            }
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        // تحديث المنتج
        $product->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully',
            'data' => $product->load(['category', 'brand', 'unit']),
        ]);
    }

    /**
     * حذف منتج
     * 
     * يقوم بحذف المنتج والصورة المرتبطة به
     * 
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(string $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found',
            ], 404);
        }

        // حذف الصورة إذا كانت موجودة
        if ($product->image && \Storage::disk('public')->exists($product->image)) {
            \Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully',
        ]);
    }
}
