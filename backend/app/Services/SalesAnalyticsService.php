<?php

namespace App\Services;

use App\Models\SalesInvoice;
use App\Models\Customer;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SalesAnalyticsService
{
    const CACHE_DURATION = 300; // 5 minutes

    /**
     * تحليلات المبيعات الشاملة
     */
    public static function getAnalytics($startDate = null, $endDate = null)
    {
        $cacheKey = 'sales_analytics_' . md5($startDate . $endDate);
        
        return Cache::remember($cacheKey, self::CACHE_DURATION, function () use ($startDate, $endDate) {
            $query = SalesInvoice::query();
            
            if ($startDate) {
                $query->whereDate('created_at', '>=', $startDate);
            }
            if ($endDate) {
                $query->whereDate('created_at', '<=', $endDate);
            }
            
            return [
                'summary' => self::getSalesSummary($query),
                'by_customer' => self::getSalesByCustomer($query),
                'by_payment_method' => self::getSalesByPaymentMethod($query),
                'by_status' => self::getSalesByStatus($query),
                'daily_trend' => self::getDailyTrend($query),
                'monthly_comparison' => self::getMonthlyComparison(),
            ];
        });
    }

    /**
     * ملخص المبيعات
     */
    private static function getSalesSummary($query)
    {
        return [
            'total_sales' => (float) $query->sum('total_amount'),
            'total_invoices' => $query->count(),
            'average_invoice' => (float) $query->avg('total_amount'),
            'total_paid' => (float) $query->sum('paid_amount'),
            'total_remaining' => (float) $query->sum('remaining_amount'),
            'total_discount' => (float) $query->sum('discount'),
            'total_tax' => (float) $query->sum('tax'),
        ];
    }

    /**
     * المبيعات حسب العميل
     */
    private static function getSalesByCustomer($query)
    {
        return $query->clone()
            ->join('customers', 'sales_invoices.customer_id', '=', 'customers.id')
            ->select(
                'customers.id',
                'customers.name',
                'customers.name_ar',
                DB::raw('COUNT(sales_invoices.id) as invoice_count'),
                DB::raw('SUM(sales_invoices.total_amount) as total_amount'),
                DB::raw('SUM(sales_invoices.paid_amount) as paid_amount'),
                DB::raw('SUM(sales_invoices.remaining_amount) as remaining_amount')
            )
            ->groupBy('customers.id', 'customers.name', 'customers.name_ar')
            ->orderByDesc('total_amount')
            ->limit(10)
            ->get();
    }

    /**
     * المبيعات حسب طريقة الدفع
     */
    private static function getSalesByPaymentMethod($query)
    {
        return $query->clone()
            ->select(
                'payment_method',
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(total_amount) as total')
            )
            ->groupBy('payment_method')
            ->get()
            ->map(function ($item) {
                return [
                    'method' => $item->payment_method,
                    'count' => (int) $item->count,
                    'total' => (float) $item->total,
                ];
            });
    }

    /**
     * المبيعات حسب الحالة
     */
    private static function getSalesByStatus($query)
    {
        return $query->clone()
            ->select(
                'status',
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(total_amount) as total')
            )
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                return [
                    'status' => $item->status,
                    'count' => (int) $item->count,
                    'total' => (float) $item->total,
                ];
            });
    }

    /**
     * الاتجاه اليومي
     */
    private static function getDailyTrend($query)
    {
        return $query->clone()
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(total_amount) as total')
            )
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->limit(30)
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'count' => (int) $item->count,
                    'total' => (float) $item->total,
                ];
            });
    }

    /**
     * مقارنة شهرية (آخر 6 أشهر)
     */
    private static function getMonthlyComparison()
    {
        $months = [];
        
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            
            $total = SalesInvoice::whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->sum('total_amount');
                
            $count = SalesInvoice::whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->count();
            
            $months[] = [
                'month' => $date->format('Y-m'),
                'month_name' => $date->format('M Y'),
                'total' => (float) $total,
                'count' => $count,
            ];
        }
        
        return $months;
    }

    /**
     * أفضل العملاء
     */
    public static function getTopCustomers($limit = 10)
    {
        return Cache::remember('top_customers_' . $limit, self::CACHE_DURATION, function () use ($limit) {
            return Customer::withCount('salesInvoices')
                ->withSum('salesInvoices', 'total_amount')
                ->orderByDesc('sales_invoices_sum_total_amount')
                ->limit($limit)
                ->get()
                ->map(function ($customer) {
                    return [
                        'id' => $customer->id,
                        'name' => $customer->name,
                        'name_ar' => $customer->name_ar,
                        'invoice_count' => $customer->sales_invoices_count,
                        'total_amount' => (float) $customer->sales_invoices_sum_total_amount,
                    ];
                });
        });
    }

    /**
     * مسح الـ Cache
     */
    public static function clearCache()
    {
        Cache::flush(); // أو يمكن استخدام pattern matching
    }
}
