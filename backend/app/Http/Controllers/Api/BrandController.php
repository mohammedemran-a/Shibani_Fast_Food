<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;

class BrandController extends Controller
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
