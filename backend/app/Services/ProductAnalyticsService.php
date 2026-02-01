<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\SalesInvoiceItem;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Service Class for Product Analytics.
 * 
 * Handles all business logic related to calculating and caching
 * product performance metrics. Designed to be scalable and maintainable.
 */
class ProductAnalyticsService
{
    /**
     * Cache duration in seconds (5 minutes).
     * @const int
     */
    private const CACHE_DURATION = 300;

    /**
     * Retrieves comprehensive product analytics.
     * This is the main entry point for product performance analysis.
     *
     * @param array $options An array of options for filtering the analytics.
     *   - 'startDate' (string|Carbon): The start date for the analysis period.
     *   - 'endDate' (string|Carbon): The end date for the analysis period.
     *   - 'limit' (int): The number of records to return for top/least lists. Default is 10.
     *   - 'categoryId' (int): Filter analytics by a specific category.
     *   - 'brandId' (int): Filter analytics by a specific brand.
     * @return array The analytics data.
     */
    public static function getAnalytics(array $options = []): array
    {
        $cacheKey = 'product_analytics_' . md5(json_encode($options));

        return Cache::remember($cacheKey, self::CACHE_DURATION, function () use ($options) {
            
            $startDate = $options['startDate'] ?? null;
            $endDate = $options['endDate'] ?? null;
            $limit = $options['limit'] ?? 10;

            return [
                'summary' => self::getProductsSummary(),
                'top_selling_by_quantity' => self::getTopSellingProducts($startDate, $endDate, $limit, 'total_quantity'),
                'top_selling_by_revenue' => self::getTopSellingProducts($startDate, $endDate, $limit, 'total_revenue'),
                'most_profitable' => self::getMostProfitableProducts($startDate, $endDate, $limit),
                'inventory_value' => self::getInventoryValue(),
                'low_stock' => self::getLowStockProducts($limit),
                'out_of_stock' => self::getOutOfStockProducts($limit),
                'by_category' => self::getProductsByCategory(),
                'by_brand' => self::getProductsByBrand(),
            ];
        });
    }

    /**
     * Provides a high-level summary of all products.
     *
     * @return array
     */
    private static function getProductsSummary(): array
    {
        $summary = Product::select(
            DB::raw('COUNT(*) as total_products'),
            DB::raw('SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_products'),
            DB::raw('SUM(CASE WHEN quantity <= reorder_level THEN 1 ELSE 0 END) as low_stock_count'),
            DB::raw('SUM(CASE WHEN quantity = 0 THEN 1 ELSE 0 END) as out_of_stock_count'),
            DB::raw('SUM(quantity) as total_quantity')
        )->first();

        return [
            'total_products' => (int) $summary->total_products,
            'active_products' => (int) $summary->active_products,
            'inactive_products' => (int) ($summary->total_products - $summary->active_products),
            'low_stock_count' => (int) $summary->low_stock_count,
            'out_of_stock_count' => (int) $summary->out_of_stock_count,
            'total_quantity' => (int) $summary->total_quantity,
        ];
    }

    /**
     * Retrieves the top-selling products, sortable by quantity or revenue.
     *
     * @param string|null $startDate
     * @param string|null $endDate
     * @param int $limit
     * @param string $orderBy 'total_quantity' or 'total_revenue'
     * @return \Illuminate\Support\Collection
     */
    private static function getTopSellingProducts(?string $startDate, ?string $endDate, int $limit, string $orderBy): \Illuminate\Support\Collection
    {
        $query = SalesInvoiceItem::join('products', 'sales_invoice_items.product_id', '=', 'products.id')
            ->select(
                'products.id',
                'products.name',
                'products.sku',
                'products.quantity as current_stock',
                DB::raw('SUM(sales_invoice_items.quantity) as total_quantity'),
                DB::raw('SUM(sales_invoice_items.total_price) as total_revenue')
            )
            ->groupBy('products.id', 'products.name', 'products.sku', 'products.quantity');

        if ($startDate && $endDate) {
            $query->join('sales_invoices', 'sales_invoice_items.sales_invoice_id', '=', 'sales_invoices.id')
                  ->whereBetween('sales_invoices.invoice_date', [Carbon::parse($startDate)->startOfDay(), Carbon::parse($endDate)->endOfDay()]);
        }

        return $query->orderByDesc($orderBy)
            ->limit($limit)
            ->get();
    }

    /**
     * Retrieves the most profitable products within a given period.
     * Profit is calculated as (Selling Price - Purchase Price) * Quantity Sold.
     *
     * @param string|null $startDate
     * @param string|null $endDate
     * @param int $limit
     * @return \Illuminate\Support\Collection
     */
    private static function getMostProfitableProducts(?string $startDate, ?string $endDate, int $limit): \Illuminate\Support\Collection
    {
        $query = SalesInvoiceItem::join('products', 'sales_invoice_items.product_id', '=', 'products.id')
            ->select(
                'products.id',
                'products.name',
                'products.sku',
                DB::raw('SUM(sales_invoice_items.quantity) as total_quantity'),
                DB::raw('SUM(sales_invoice_items.total_price) as total_revenue'),
                
                // =================================================================
                // **التعديل الرئيسي هنا: استخدام سعر الشراء من جدول sales_invoice_items**
                // =================================================================
                /**
                 * هذا هو الحساب الدقيق والمستدام للربح.
                 * نستخدم 'sales_invoice_items.purchase_price' الذي يسجل تكلفة المنتج
                 * في لحظة البيع الفعلية، مما يضمن دقة التقارير المالية.
                 */
                DB::raw('SUM(sales_invoice_items.quantity * (sales_invoice_items.unit_price - sales_invoice_items.purchase_price)) as total_profit')
            )
            ->groupBy('products.id', 'products.name', 'products.sku');

        if ($startDate && $endDate) {
            $query->join('sales_invoices', 'sales_invoice_items.sales_invoice_id', '=', 'sales_invoices.id')
                  ->whereBetween('sales_invoices.invoice_date', [Carbon::parse($startDate)->startOfDay(), Carbon::parse($endDate)->endOfDay()]);
        }

        return $query->orderByDesc('total_profit')
            ->limit($limit)
            ->get();
    }

    /**
     * Retrieves products that are currently low in stock.
     *
     * @param int $limit
     * @return \Illuminate\Support\Collection
     */
    private static function getLowStockProducts(int $limit): \Illuminate\Support\Collection
    {
        return Product::whereColumn('quantity', '<=', 'reorder_level')
            ->where('quantity', '>', 0)
            ->select('id', 'name', 'sku', 'quantity', 'reorder_level')
            ->orderBy('quantity', 'asc')
            ->limit($limit)
            ->get();
    }

    /**
     * Retrieves products that are out of stock.
     *
     * @param int $limit
     * @return \Illuminate\Support\Collection
     */
    private static function getOutOfStockProducts(int $limit): \Illuminate\Support\Collection
    {
        return Product::where('quantity', 0)
            ->select('id', 'name', 'sku', 'reorder_level')
            ->limit($limit)
            ->get();
    }

    /**
     * Calculates the total value of the current inventory.
     *
     * @return array
     */
    private static function getInventoryValue(): array
    {
        $result = Product::selectRaw('
            SUM(quantity * purchase_price) as value_by_purchase_price,
            SUM(quantity * selling_price) as value_by_selling_price,
            SUM(quantity * (selling_price - purchase_price)) as potential_profit
        ')->first();

        return [
            'by_purchase_price' => (float) $result->value_by_purchase_price,
            'by_selling_price' => (float) $result->value_by_selling_price,
            'potential_profit' => (float) $result->potential_profit,
        ];
    }

    /**
     * Aggregates product counts and quantities by category.
     *
     * @return \Illuminate\Support\Collection
     */
    private static function getProductsByCategory(): \Illuminate\Support\Collection
    {
        return Category::withCount('products')
            ->select('id', 'name')
            ->get()
            ->map(function ($category) {
                $stats = Product::where('category_id', $category->id)
                    ->selectRaw('SUM(quantity) as total_quantity, SUM(quantity * purchase_price) as total_value')
                    ->first();
                
                $category->products_count = (int) $category->products_count;
                $category->total_quantity = (int) $stats->total_quantity;
                $category->total_value = (float) $stats->total_value;
                return $category;
            });
    }

    /**
     * Aggregates product counts and quantities by brand.
     *
     * @return \Illuminate\Support\Collection
     */
    private static function getProductsByBrand(): \Illuminate\Support\Collection
    {
        return Brand::withCount('products')
            ->select('id', 'name')
            ->get()
            ->map(function ($brand) {
                $stats = Product::where('brand_id', $brand->id)
                    ->selectRaw('SUM(quantity) as total_quantity, SUM(quantity * purchase_price) as total_value')
                    ->first();

                $brand->products_count = (int) $brand->products_count;
                $brand->total_quantity = (int) $stats->total_quantity;
                $brand->total_value = (float) $stats->total_value;
                return $brand;
            });
    }

    /**
     * Clears all caches related to this service.
     *
     * @return void
     */
    public static function clearCache(): void
    {
        Cache::flush();
    }
}
