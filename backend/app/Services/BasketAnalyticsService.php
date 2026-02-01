<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Service Class for Basket Analysis.
 * 
 * Handles the business logic for identifying product associations
 * within sales invoices.
 */
class BasketAnalyticsService
{
    /**
     * Finds pairs of products that are frequently bought together.
     *
     * @param array $options An array of filtering options.
     *   - 'startDate' (string|null): The start date for the analysis.
     *   - 'endDate' (string|null): The end date for the analysis.
     *   - 'limit' (int): The number of pairs to return.
     *   - 'minSupport' (int): The minimum number of times a pair must appear together.
     * @return \Illuminate\Support\Collection
     */
    public static function findProductPairs(array $options = [])
    {
        $startDate = $options['startDate'] ?? null;
        $endDate = $options['endDate'] ?? null;
        $limit = $options['limit'] ?? 20;
        $minSupport = $options['minSupport'] ?? 5; // يتطلب ظهور الزوج 5 مرات على الأقل

        // استعلام لجلب أزواج المنتجات من نفس الفاتورة
        $query = DB::table('sales_invoice_items as item1')
            ->join('sales_invoice_items as item2', 'item1.sales_invoice_id', '=', 'item2.sales_invoice_id')
            ->join('products as p1', 'item1.product_id', '=', 'p1.id')
            ->join('products as p2', 'item2.product_id', '=', 'p2.id')
            ->whereColumn('item1.product_id', '<', 'item2.product_id') // لتجنب التكرار (A,B) و (B,A) والأزواج الذاتية (A,A)
            ->select(
                'p1.name as productA',
                'p2.name as productB',
                DB::raw('COUNT(DISTINCT item1.sales_invoice_id) as pair_count')
            )
            ->groupBy('p1.name', 'p2.name')
            ->having('pair_count', '>=', $minSupport)
            ->orderByDesc('pair_count')
            ->limit($limit);

        // فلترة حسب التاريخ إذا تم توفيره
        if ($startDate && $endDate) {
            $query->join('sales_invoices', 'item1.sales_invoice_id', '=', 'sales_invoices.id')
                  ->whereBetween('sales_invoices.invoice_date', [Carbon::parse($startDate)->startOfDay(), Carbon::parse($endDate)->endOfDay()]);
        }

        $pairs = $query->get();

        // حساب إجمالي عدد الفواتير في الفترة المحددة لحساب النسبة المئوية
        $totalInvoicesQuery = DB::table('sales_invoices');
        if ($startDate && $endDate) {
            $totalInvoicesQuery->whereBetween('invoice_date', [$startDate, $endDate]);
        }
        $totalInvoices = $totalInvoicesQuery->count();

        // إضافة النسبة المئوية لكل زوج
        return $pairs->map(function ($pair) use ($totalInvoices) {
            $pair->percentage = ($totalInvoices > 0) ? round(($pair->pair_count / $totalInvoices) * 100) : 0;
            return $pair;
        });
    }
}
