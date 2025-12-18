<?php

// This file contains all the controller implementations
// They will be split into individual files in the next step

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Unit;
use App\Models\Currency;
use App\Models\SalesInvoice;
use App\Models\PurchaseInvoice;
use App\Models\Customer;
use App\Models\Supplier;
use App\Models\Debt;
use App\Models\Expense;
use App\Models\ProductReturn;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;

/**
 * PRODUCT CONTROLLER
 */
class ProductControllerImpl extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'brand', 'unit']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%$search%")
                  ->orWhere('name_ar', 'like', "%$search%")
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
            $query->where('is_active', $request->is_active);
        }

        $products = $query->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'name_ar' => 'required|string',
            'sku' => 'required|unique:products',
            'barcode' => 'required|unique:products',
            'category_id' => 'required|exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'unit_id' => 'required|exists:units,id',
            'purchase_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'quantity' => 'required|integer|min:0',
            'reorder_level' => 'integer|min:0',
            'expiry_date' => 'nullable|date',
            'description' => 'nullable|string',
        ]);

        $product = Product::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully',
            'data' => $product->load(['category', 'brand', 'unit']),
        ], 201);
    }

    public function show(Product $product)
    {
        return response()->json([
            'success' => true,
            'data' => $product->load(['category', 'brand', 'unit']),
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'string',
            'name_ar' => 'string',
            'sku' => 'unique:products,sku,' . $product->id,
            'barcode' => 'unique:products,barcode,' . $product->id,
            'category_id' => 'exists:categories,id',
            'brand_id' => 'nullable|exists:brands,id',
            'unit_id' => 'exists:units,id',
            'purchase_price' => 'numeric|min:0',
            'selling_price' => 'numeric|min:0',
            'quantity' => 'integer|min:0',
            'reorder_level' => 'integer|min:0',
            'expiry_date' => 'nullable|date',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $product->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully',
            'data' => $product->load(['category', 'brand', 'unit']),
        ]);
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully',
        ]);
    }
}

/**
 * CATEGORY CONTROLLER
 */
class CategoryControllerImpl extends Controller
{
    public function index()
    {
        $categories = Category::all();
        return response()->json(['success' => true, 'data' => $categories]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:categories',
            'name_ar' => 'required|string|unique:categories',
            'description' => 'nullable|string',
        ]);

        $category = Category::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Category created successfully',
            'data' => $category,
        ], 201);
    }

    public function show(Category $category)
    {
        return response()->json(['success' => true, 'data' => $category]);
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'string|unique:categories,name,' . $category->id,
            'name_ar' => 'string|unique:categories,name_ar,' . $category->id,
            'description' => 'nullable|string',
        ]);

        $category->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Category updated successfully',
            'data' => $category,
        ]);
    }

    public function destroy(Category $category)
    {
        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully',
        ]);
    }
}

/**
 * BRAND CONTROLLER
 */
class BrandControllerImpl extends Controller
{
    public function index()
    {
        $brands = Brand::all();
        return response()->json(['success' => true, 'data' => $brands]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:brands',
            'name_ar' => 'required|string|unique:brands',
            'description' => 'nullable|string',
        ]);

        $brand = Brand::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Brand created successfully',
            'data' => $brand,
        ], 201);
    }

    public function show(Brand $brand)
    {
        return response()->json(['success' => true, 'data' => $brand]);
    }

    public function update(Request $request, Brand $brand)
    {
        $validated = $request->validate([
            'name' => 'string|unique:brands,name,' . $brand->id,
            'name_ar' => 'string|unique:brands,name_ar,' . $brand->id,
            'description' => 'nullable|string',
        ]);

        $brand->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Brand updated successfully',
            'data' => $brand,
        ]);
    }

    public function destroy(Brand $brand)
    {
        $brand->delete();

        return response()->json([
            'success' => true,
            'message' => 'Brand deleted successfully',
        ]);
    }
}

/**
 * UNIT CONTROLLER
 */
class UnitControllerImpl extends Controller
{
    public function index()
    {
        $units = Unit::all();
        return response()->json(['success' => true, 'data' => $units]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:units',
            'name_ar' => 'required|string|unique:units',
            'abbreviation' => 'required|string',
        ]);

        $unit = Unit::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Unit created successfully',
            'data' => $unit,
        ], 201);
    }

    public function show(Unit $unit)
    {
        return response()->json(['success' => true, 'data' => $unit]);
    }

    public function update(Request $request, Unit $unit)
    {
        $validated = $request->validate([
            'name' => 'string|unique:units,name,' . $unit->id,
            'name_ar' => 'string|unique:units,name_ar,' . $unit->id,
            'abbreviation' => 'string',
        ]);

        $unit->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Unit updated successfully',
            'data' => $unit,
        ]);
    }

    public function destroy(Unit $unit)
    {
        $unit->delete();

        return response()->json([
            'success' => true,
            'message' => 'Unit deleted successfully',
        ]);
    }
}

/**
 * CURRENCY CONTROLLER
 */
class CurrencyControllerImpl extends Controller
{
    public function index()
    {
        $currencies = Currency::all();
        return response()->json(['success' => true, 'data' => $currencies]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'code' => 'required|string|unique:currencies',
            'symbol' => 'required|string',
            'exchange_rate' => 'numeric|min:0',
            'is_default' => 'boolean',
        ]);

        $currency = Currency::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Currency created successfully',
            'data' => $currency,
        ], 201);
    }

    public function show(Currency $currency)
    {
        return response()->json(['success' => true, 'data' => $currency]);
    }

    public function update(Request $request, Currency $currency)
    {
        $validated = $request->validate([
            'name' => 'string',
            'code' => 'string|unique:currencies,code,' . $currency->id,
            'symbol' => 'string',
            'exchange_rate' => 'numeric|min:0',
            'is_default' => 'boolean',
        ]);

        $currency->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Currency updated successfully',
            'data' => $currency,
        ]);
    }

    public function destroy(Currency $currency)
    {
        $currency->delete();

        return response()->json([
            'success' => true,
            'message' => 'Currency deleted successfully',
        ]);
    }
}
