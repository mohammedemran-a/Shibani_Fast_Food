<?php

namespace App\Services;

use App\Models\Product;
use App\Models\SalesInvoice;
use App\Models\PurchaseInvoice;
use App\Models\Customer;
use App\Models\Supplier;
use App\Models\Expense;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardService
{
    /**
     * Cache duration in seconds (5 minutes)
     */
    const CACHE_DURATION = 300;

    /**
     * Get all dashboard statistics with caching
     */
    public static function getStats()
    {
        return Cache::remember('dashboard_stats', self::CACHE_DURATION, function () {
            return [
                // المبيعات
                'sales' => self::getSalesStats(),
                
                // المشتريات
                'purchases' => self::getPurchasesStats(),
                
                // المنتجات
                'products' => self::getProductsStats(),
                
                // العملاء والموردين
                'people' => self::getPeopleStats(),
                
                // الأرباح
                'profit' => self::getProfitStats(),
                
                // المصروفات
                'expenses' => self::getExpensesStats(),
                
                // أفضل المنتجات مبيعاً (Top 5)
                'top_products' => self::getTopProducts(),
                
                // مبيعات آخر 7 أيام
                'sales_chart' => self::getLast7DaysSales(),
                
                // مشتريات آخر 7 أيام
                'purchases_chart' => self::getLast7DaysPurchases(),
                
                // وقت آخر تحديث
                'last_updated' => now()->toDateTimeString(),
            ];
        });
    }

    /**
     * إحصائيات المبيعات
     */
    private static function getSalesStats()
    {
        return [
            'total' => (float) SalesInvoice::sum('total_amount'),
            'today' => (float) SalesInvoice::whereDate('created_at', today())->sum('total_amount'),
            'this_month' => (float) SalesInvoice::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('total_amount'),
            'count' => SalesInvoice::count(),
            'today_count' => SalesInvoice::whereDate('created_at', today())->count(),
        ];
    }

    /**
     * إحصائيات المشتريات
     */
    private static function getPurchasesStats()
    {
        return [
            'total' => (float) PurchaseInvoice::sum('total_amount'),
            'today' => (float) PurchaseInvoice::whereDate('created_at', today())->sum('total_amount'),
            'this_month' => (float) PurchaseInvoice::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('total_amount'),
            'count' => PurchaseInvoice::count(),
            'today_count' => PurchaseInvoice::whereDate('created_at', today())->count(),
        ];
    }

    /**
     * إحصائيات المنتجات
     */
    private static function getProductsStats()
    {
        return [
            'total_count' => Product::count(),
            'active_count' => Product::where('is_active', true)->count(),
            'low_stock_count' => Product::whereRaw('quantity <= min_quantity')->count(),
            'out_of_stock_count' => Product::where('quantity', 0)->count(),
            'total_value' => (float) Product::selectRaw('SUM(quantity * purchase_price) as total')->value('total'),
        ];
    }

    /**
     * إحصائيات العملاء والموردين
     */
    private static function getPeopleStats()
    {
        return [
            'customers_count' => Customer::count(),
            'new_customers_this_month' => Customer::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
            'suppliers_count' => Supplier::count(),
            'active_customers' => Customer::where('is_active', true)->count(),
        ];
    }

    /**
     * إحصائيات الأرباح
     */
    private static function getProfitStats()
    {
        $totalSales = (float) SalesInvoice::sum('total_amount');
        $totalPurchases = (float) PurchaseInvoice::sum('total_amount');
        $totalExpenses = (float) Expense::sum('amount');
        
        $monthlySales = (float) SalesInvoice::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('total_amount');
            
        $monthlyPurchases = (float) PurchaseInvoice::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('total_amount');
            
        $monthlyExpenses = (float) Expense::whereMonth('date', now()->month)
            ->whereYear('date', now()->year)
            ->sum('amount');

        return [
            'total_profit' => $totalSales - $totalPurchases - $totalExpenses,
            'monthly_profit' => $monthlySales - $monthlyPurchases - $monthlyExpenses,
            'profit_margin' => $totalSales > 0 ? (($totalSales - $totalPurchases) / $totalSales) * 100 : 0,
        ];
    }

    /**
     * إحصائيات المصروفات
     */
    private static function getExpensesStats()
    {
        return [
            'total' => (float) Expense::sum('amount'),
            'today' => (float) Expense::whereDate('date', today())->sum('amount'),
            'this_month' => (float) Expense::whereMonth('date', now()->month)
                ->whereYear('date', now()->year)
                ->sum('amount'),
            'count' => Expense::count(),
        ];
    }

    /**
     * أفضل 5 منتجات مبيعاً
     * محسّن للبيانات الكبيرة
     */
    private static function getTopProducts()
    {
        try {
            return DB::table('sales_invoice_items')
                ->join('products', 'sales_invoice_items.product_id', '=', 'products.id')
                ->select(
                    'products.id',
                    'products.name',
                    'products.name_ar',
                    DB::raw('SUM(sales_invoice_items.quantity) as total_sold'),
                    DB::raw('SUM(sales_invoice_items.total) as total_revenue')
                )
                ->groupBy('products.id', 'products.name', 'products.name_ar')
                ->orderByDesc('total_sold')
                ->limit(5)
                ->get()
                ->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'name' => $item->name,
                        'name_ar' => $item->name_ar,
                        'total_sold' => (int) $item->total_sold,
                        'total_revenue' => (float) $item->total_revenue,
                    ];
                });
        } catch (\Exception $e) {
            \Log::error('Top Products Error: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * مبيعات آخر 7 أيام
     */
    private static function getLast7DaysSales()
    {
        $last7Days = [];
        
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $last7Days[] = [
                'date' => $date->format('Y-m-d'),
                'day' => $date->format('D'),
                'total' => (float) SalesInvoice::whereDate('created_at', $date)->sum('total_amount'),
                'count' => SalesInvoice::whereDate('created_at', $date)->count(),
            ];
        }
        
        return $last7Days;
    }

    /**
     * مشتريات آخر 7 أيام
     */
    private static function getLast7DaysPurchases()
    {
        $last7Days = [];
        
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $last7Days[] = [
                'date' => $date->format('Y-m-d'),
                'day' => $date->format('D'),
                'total' => (float) PurchaseInvoice::whereDate('created_at', $date)->sum('total_amount'),
                'count' => PurchaseInvoice::whereDate('created_at', $date)->count(),
            ];
        }
        
        return $last7Days;
    }

    /**
     * مسح الـ Cache يدوياً
     */
    public static function clearCache()
    {
        return Cache::forget('dashboard_stats');
    }

    /**
     * تحديث الـ Cache
     */
    public static function refreshCache()
    {
        self::clearCache();
        return self::getStats();
    }
}
