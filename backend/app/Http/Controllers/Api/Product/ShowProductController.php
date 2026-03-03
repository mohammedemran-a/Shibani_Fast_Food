<?php

namespace App\Http\Controllers\Api\Product;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;

class ShowProductController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * يعرض بيانات منتج واحد محدد مع كل علاقاته اللازمة لصفحة التعديل.
     */
    public function __invoke(Product $product): JsonResponse
    {
        return response()->json($product->load('category', 'ingredients', 'availableModifiers'));
    }
}
