<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'brand', 'unit']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%$search%")
                  ->orWhere('sku', 'like', "%$search%")
                  ->orWhere('barcode', 'like', "%$search%");
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('brand_id')) {
            $query->where('brand_id', $request->brand_id);
        }

        if ($request->has('is_active')) {
            // Convert string 'true'/'false' to boolean 1/0
            $isActive = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN);
            $query->where('is_active', $isActive);
        }

        // Get all products if no pagination requested, otherwise paginate
        if ($request->has('all') && $request->all == 'true') {
            $products = $query->get();
            return response()->json([
                'success' => true,
                'data' => ['data' => $products, 'total' => $products->count()],
            ]);
        }
        
        $products = $query->paginate($request->per_page ?? 1000);

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
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

        // Handle category - create if name provided
        if (!empty($validated['category_name'])) {
            $category = \App\Models\Category::firstOrCreate(
                ['name' => $validated['category_name']]
            );
            $validated['category_id'] = $category->id;
        }
        
        // Handle brand - create if name provided
        if (!empty($validated['brand_name'])) {
            $brand = \App\Models\Brand::firstOrCreate(
                ['name' => $validated['brand_name']]
            );
            $validated['brand_id'] = $brand->id;
        }
        
        // Handle unit - create if name provided
        if (!empty($validated['unit_name'])) {
            $abbr = preg_match('/^[a-zA-Z]/', $validated['unit_name']) 
                ? strtolower(substr($validated['unit_name'], 0, 3)) 
                : 'u' . substr(md5($validated['unit_name']), 0, 2);
            
            $unit = \App\Models\Unit::firstOrCreate(
                ['name' => $validated['unit_name']],
                ['abbreviation' => $abbr]
            );
            $validated['unit_id'] = $unit->id;
        }
        
        // Validate required IDs
        if (empty($validated['category_id'])) {
            return response()->json([
                'success' => false,
                'message' => 'Category is required',
            ], 422);
        }
        
        if (empty($validated['unit_id'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unit is required',
            ], 422);
        }

        // Set is_active to true by default
        if (!isset($validated['is_active'])) {
            $validated['is_active'] = true;
        }
        
        // Auto-generate SKU if not provided
        if (empty($validated['sku'])) {
            $validated['sku'] = 'PRD-' . time() . rand(100, 999);
        }
        
        // Auto-generate barcode if not provided
        if (empty($validated['barcode'])) {
            $validated['barcode'] = time() . rand(1000, 9999);
        }
        
        // Handle image upload
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $product = Product::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully',
            'data' => $product->load(['category', 'brand', 'unit']),
        ], 201);
    }

    /**
     * Display the specified resource.
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
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
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

        // Handle category by name
        if (!empty($validated['category_name']) && empty($validated['category_id'])) {
            $category = \App\Models\Category::firstOrCreate(
                ['name' => $validated['category_name']],
                ['description' => '']
            );
            $validated['category_id'] = $category->id;
        }
        unset($validated['category_name']);

        // Handle brand by name
        if (!empty($validated['brand_name']) && empty($validated['brand_id'])) {
            $brand = \App\Models\Brand::firstOrCreate(
                ['name' => $validated['brand_name']],
                ['description' => '']
            );
            $validated['brand_id'] = $brand->id;
        }
        unset($validated['brand_name']);

        // Handle unit by name
        if (!empty($validated['unit_name']) && empty($validated['unit_id'])) {
            $unit = \App\Models\Unit::firstOrCreate(
                ['name' => $validated['unit_name']],
                ['abbreviation' => mb_substr($validated['unit_name'], 0, 3)]
            );
            $validated['unit_id'] = $unit->id;
        }
        unset($validated['unit_name']);

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($product->image && \Storage::disk('public')->exists($product->image)) {
                \Storage::disk('public')->delete($product->image);
            }
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully',
            'data' => $product->load(['category', 'brand', 'unit']),
        ]);
    }

    /**
     * Remove the specified resource from storage.
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

        // Delete image if exists
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
