<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class ProductAnalyticsService
{
    const CACHE_DURATION = 300; // 5 minutes

    /**
     * تحليلات المنتجات الشاملة
     */
    public static function getAnalytics()
    {
        return Cache::remember('product_analytics', self::CACHE_DURATION, function () {
            return [
                'summary' => self::getProductsSummary(),
                'by_category' => self::getProductsByCategory(),
                'by_brand' => self::getProductsByBrand(),
                'low_stock' => self::getLowStockProducts(),
                'out_of_stock' => self::getOutOfStockProducts(),
                'top_selling' => self::getTopSellingProducts(),
                'inventory_value' => self::getInventoryValue(),
            ];
        });
    }

    /**
     * ملخص المنتجات
     */
    private static function getProductsSummary()
    {
        return [
            'total_products' => Product::count(),
            'active_products' => Product::where('is_active', true)->count(),
            'inactive_products' => Product::where('is_active', false)->count(),
            'low_stock_count' => Product::whereRaw('quantity <= min_quantity')->count(),
            'out_of_stock_count' => Product::where('quantity', 0)->count(),
            'total_quantity' => (int) Product::sum('quantity'),
            'total_purchase_value' => (float) Product::selectRaw('SUM(quantity * purchase_price)')->value('SUM(quantity * purchase_price)'),
            'total_sale_value' => (float) Product::selectRaw('SUM(quantity * sale_price)')->value('SUM(quantity * sale_price)'),
        ];
    }

    /**
     * المنتجات حسب الفئة
     */
    private static function getProductsByCategory()
    {
        return Category::withCount('products')
            ->with(['products' => function ($query) {
                $query->select('category_id', DB::raw('SUM(quantity) as total_quantity'));
            }])
            ->get()
            ->map(function ($category) {
                $totalQuantity = Product::where('category_id', $category->id)->sum('quantity');
                $totalValue = Product::where('category_id', $category->id)
                    ->selectRaw('SUM(quantity * purchase_price) as total')
                    ->value('total');
                
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'name_ar' => $category->name_ar,
                    'products_count' => $category->products_count,
                    'total_quantity' => (int) $totalQuantity,
                    'total_value' => (float) $totalValue,
                ];
            });
    }

    /**
     * المنتجات حسب العلامة التجارية
     */
    private static function getProductsByBrand()
    {
        return Brand::withCount('products')
            ->get()
            ->map(function ($brand) {
                $totalQuantity = Product::where('brand_id', $brand->id)->sum('quantity');
                $totalValue = Product::where('brand_id', $brand->id)
                    ->selectRaw('SUM(quantity * purchase_price) as total')
                    ->value('total');
                
                return [
                    'id' => $brand->id,
                    'name' => $brand->name,
                    'name_ar' => $brand->name_ar,
                    'products_count' => $brand->products_count,
                    'total_quantity' => (int) $totalQuantity,
                    'total_value' => (float) $totalValue,
                ];
            });
    }

    /**
     * المنتجات منخفضة المخزون
     */
    private static function getLowStockProducts()
    {
        return Product::whereRaw('quantity <= min_quantity')
            ->where('quantity', '>', 0)
            ->select('id', 'name', 'name_ar', 'sku', 'quantity', 'min_quantity', 'purchase_price', 'sale_price')
            ->orderBy('quantity', 'asc')
            ->limit(20)
            ->get();
    }

    /**
     * المنتجات نفذت من المخزون
     */
    private static function getOutOfStockProducts()
    {
        return Product::where('quantity', 0)
            ->select('id', 'name', 'name_ar', 'sku', 'min_quantity', 'purchase_price', 'sale_price')
            ->limit(20)
            ->get();
    }

    /**
     * أفضل المنتجات مبيعاً
     */
    private static function getTopSellingProducts()
    {
        return DB::table('sales_invoice_items')
            ->join('products', 'sales_invoice_items.product_id', '=', 'products.id')
            ->select(
                'products.id',
                'products.name',
                'products.name_ar',
                'products.sku',
                'products.quantity as current_stock',
                DB::raw('SUM(sales_invoice_items.quantity) as total_sold'),
                DB::raw('SUM(sales_invoice_items.total) as total_revenue')
            )
            ->groupBy('products.id', 'products.name', 'products.name_ar', 'products.sku', 'products.quantity')
            ->orderByDesc('total_sold')
            ->limit(20)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'name_ar' => $item->name_ar,
                    'sku' => $item->sku,
                    'current_stock' => (int) $item->current_stock,
                    'total_sold' => (int) $item->total_sold,
                    'total_revenue' => (float) $item->total_revenue,
                ];
            });
    }

    /**
     * قيمة المخزون
     */
    private static function getInventoryValue()
    {
        return [
            'by_purchase_price' => (float) Product::selectRaw('SUM(quantity * purchase_price)')->value('SUM(quantity * purchase_price)'),
            'by_sale_price' => (float) Product::selectRaw('SUM(quantity * sale_price)')->value('SUM(quantity * sale_price)'),
            'potential_profit' => (float) Product::selectRaw('SUM(quantity * (sale_price - purchase_price))')->value('SUM(quantity * (sale_price - purchase_price))'),
        ];
    }

    /**
     * تقرير حركة المنتج
     */
    public static function getProductMovement($productId)
    {
        $cacheKey = 'product_movement_' . $productId;
        
        return Cache::remember($cacheKey, self::CACHE_DURATION, function () use ($productId) {
            $product = Product::findOrFail($productId);
            
            // المبيعات
            $sales = DB::table('sales_invoice_items')
                ->where('product_id', $productId)
                ->select(
                    DB::raw('SUM(quantity) as total_sold'),
                    DB::raw('SUM(total) as total_revenue')
                )
                ->first();
            
            // المشتريات
            $purchases = DB::table('purchase_invoice_items')
                ->where('product_id', $productId)
                ->select(
                    DB::raw('SUM(quantity) as total_purchased'),
                    DB::raw('SUM(total) as total_cost')
                )
                ->first();
            
            return [
                'product' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'name_ar' => $product->name_ar,
                    'sku' => $product->sku,
                    'current_quantity' => $product->quantity,
                    'min_quantity' => $product->min_quantity,
                ],
                'sales' => [
                    'total_sold' => (int) ($sales->total_sold ?? 0),
                    'total_revenue' => (float) ($sales->total_revenue ?? 0),
                ],
                'purchases' => [
                    'total_purchased' => (int) ($purchases->total_purchased ?? 0),
                    'total_cost' => (float) ($purchases->total_cost ?? 0),
                ],
            ];
        });
    }

    /**
     * مسح الـ Cache
     */
    public static function clearCache()
    {
        Cache::flush();
    }
}
