<?php

namespace App\Http\Controllers\Api\Product;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;

class DestroyProductController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * يقوم بحذف منتج من قاعدة البيانات.
     */
    public function __invoke(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json(null, 204); // 204 No Content
    }
}
