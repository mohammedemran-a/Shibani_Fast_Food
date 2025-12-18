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
     * @param string|null $period - today, week, month, all
     * @param string|null $start_date - Custom start date
     * @param string|null $end_date - Custom end date
     */
    public static function getStats($period = 'all', $start_date = null, $end_date = null)
    {
        $cacheKey = 'dashboard_stats_' . $period . '_' . $start_date . '_' . $end_date;
        
        return Cache::remember($cacheKey, self::CACHE_DURATION, function () use ($period, $start_date, $end_date) {
            // تحديد الفترة الزمنية
            $dateRange = self::getDateRange($period, $start_date, $end_date);
            
            return [
                // المبيعات
                'sales' => self::getSalesStats($dateRange),
                
                // المشتريات
                'purchases' => self::getPurchasesStats($dateRange),
                
                // المنتجات
                'products' => self::getProductsStats(),
                
                // العملاء والموردين
                'people' => self::getPeopleStats(),
                
                // الأرباح
                'profit' => self::getProfitStats($dateRange),
                
                // المصروفات
                'expenses' => self::getExpensesStats($dateRange),
                
                // أفضل المنتجات مبيعاً (Top 5)
                'top_products' => self::getTopProducts($dateRange),
                
                // مبيعات آخر 7 أيام
                'sales_chart' => self::getLast7DaysSales($dateRange),
                
                // مشتريات آخر 7 أيام
                'purchases_chart' => self::getLast7DaysPurchases($dateRange),
                
                // الفترة المحددة
                'period' => $period,
                'date_range' => $dateRange,
                
                // وقت آخر تحديث
                'last_updated' => now()->toDateTimeString(),
            ];
        });
    }
    
    /**
     * تحديد نطاق التاريخ
     */
    private static function getDateRange($period, $start_date = null, $end_date = null)
    {
        $now = Carbon::now();
        
        switch ($period) {
            case 'today':
                return [
                    'start' => Carbon::today(),
                    'end' => Carbon::today()->endOfDay(),
                ];
            
            case 'week':
                return [
                    'start' => $now->copy()->subDays(7),
                    'end' => $now,
                ];
            
            case 'month':
                return [
                    'start' => $now->copy()->subDays(30),
                    'end' => $now,
                ];
            
            case 'custom':
                if ($start_date && $end_date) {
                    return [
                        'start' => Carbon::parse($start_date),
                        'end' => Carbon::parse($end_date)->endOfDay(),
                    ];
                }
                // fallthrough to 'all' if custom dates not provided
            
            case 'all':
            default:
                return [
                    'start' => null,
                    'end' => null,
                ];
        }
    }

    /**
     * إحصائيات المبيعات
     */
    private static function getSalesStats($dateRange = null)
    {
        $query = SalesInvoice::query();
        
        if ($dateRange && $dateRange['start'] && $dateRange['end']) {
            $query->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
        }
        
        return [
            'total' => (float) $query->sum('total_amount'),
            'count' => $query->count(),
            'average' => $query->count() > 0 ? (float) $query->avg('total_amount') : 0,
        ];
    }

    /**
     * إحصائيات المشتريات
     */
    private static function getPurchasesStats($dateRange = null)
    {
        $query = PurchaseInvoice::query();
        
        if ($dateRange && $dateRange['start'] && $dateRange['end']) {
            $query->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
        }
        
        return [
            'total' => (float) $query->sum('total_amount'),
            'count' => $query->count(),
            'average' => $query->count() > 0 ? (float) $query->avg('total_amount') : 0,
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
            'low_stock_count' => Product::whereRaw('quantity <= reorder_level')->count(),
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
    private static function getProfitStats($dateRange = null)
    {
        $salesQuery = SalesInvoice::query();
        $purchasesQuery = PurchaseInvoice::query();
        $expensesQuery = Expense::query();
        
        if ($dateRange && $dateRange['start'] && $dateRange['end']) {
            $salesQuery->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
            $purchasesQuery->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
            $expensesQuery->whereBetween('date', [$dateRange['start'], $dateRange['end']]);
        }
        
        $totalSales = (float) $salesQuery->sum('total_amount');
        $totalPurchases = (float) $purchasesQuery->sum('total_amount');
        $totalExpenses = (float) $expensesQuery->sum('amount');

        return [
            'total' => $totalSales - $totalPurchases - $totalExpenses,
            'margin' => $totalSales > 0 ? (($totalSales - $totalPurchases) / $totalSales) * 100 : 0,
        ];
    }

    /**
     * إحصائيات المصروفات
     */
    private static function getExpensesStats($dateRange = null)
    {
        $query = Expense::query();
        
        if ($dateRange && $dateRange['start'] && $dateRange['end']) {
            $query->whereBetween('date', [$dateRange['start'], $dateRange['end']]);
        }
        
        return [
            'total' => (float) $query->sum('amount'),
            'count' => $query->count(),
        ];
    }

    /**
     * أفضل 5 منتجات مبيعاً
     * محسّن للبيانات الكبيرة
     */
    private static function getTopProducts($dateRange = null)
    {
        try {
            $query = DB::table('sales_invoice_items')
                ->join('products', 'sales_invoice_items.product_id', '=', 'products.id')
                ->join('sales_invoices', 'sales_invoice_items.sales_invoice_id', '=', 'sales_invoices.id');
            
            if ($dateRange && $dateRange['start'] && $dateRange['end']) {
                $query->whereBetween('sales_invoices.created_at', [$dateRange['start'], $dateRange['end']]);
            }
            
            return $query->select(
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
    private static function getLast7DaysSales($dateRange = null)
    {
        $last7Days = [];
        $endDate = $dateRange && $dateRange['end'] ? Carbon::parse($dateRange['end']) : Carbon::today();
        
        for ($i = 6; $i >= 0; $i--) {
            $date = $endDate->copy()->subDays($i);
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
    private static function getLast7DaysPurchases($dateRange = null)
    {
        $last7Days = [];
        $endDate = $dateRange && $dateRange['end'] ? Carbon::parse($dateRange['end']) : Carbon::today();
        
        for ($i = 6; $i >= 0; $i--) {
            $date = $endDate->copy()->subDays($i);
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
