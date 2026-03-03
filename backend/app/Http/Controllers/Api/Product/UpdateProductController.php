<?php

namespace App\Http\Controllers\Api\Product;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class UpdateProductController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * يقوم بتحديث بيانات منتج موجود في قاعدة البيانات.
     */
    public function __invoke(Request $request, Product $product): JsonResponse
    {
        $validatedData = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('products')->ignore($product->id)],
            'type' => ['required', Rule::in(['Sellable', 'RawMaterial'])],
            'category_id' => 'nullable|exists:categories,id',
            'price' => 'required_if:type,Sellable|nullable|numeric|min:0',
            'cost' => 'required_if:type,RawMaterial|nullable|numeric|min:0',
            'unit' => 'required_if:type,RawMaterial|nullable|string',
            'stock' => 'nullable|numeric|min:0',
            'reorder_level' => 'nullable|numeric|min:0',
            'is_active' => 'sometimes|boolean',
            'ingredients' => 'required_if:type,Sellable|nullable|array',
            'ingredients.*.id' => 'required|exists:products,id',
            'ingredients.*.quantity' => 'required|numeric|min:0',
        ]);

        $product->update($validatedData);

        if ($product->type === 'Sellable') {
            if ($request->has('ingredients')) {
                $this->syncIngredients($product, $request->ingredients);
                $this->calculateProductCost($product);
            }
        }

        return response()->json($product->load('category', 'ingredients'));
    }

    private function syncIngredients(Product $product, array $ingredients): void
    {
        $ingredientsToSync = [];
        foreach ($ingredients as $ingredient) {
            $ingredientsToSync[$ingredient['id']] = ['quantity' => $ingredient['quantity']];
        }
        $product->ingredients()->sync($ingredientsToSync);
    }

    private function calculateProductCost(Product $product): void
    {
        $product->load('ingredients');
        $totalCost = 0;
        foreach ($product->ingredients as $ingredient) {
            $totalCost += $ingredient->pivot->quantity * $ingredient->cost;
        }
        $product->cost = $totalCost;
        $product->save();
    }
}
