<?php

namespace App\Services;

use App\Models\PurchaseInvoice;
use App\Models\Supplier;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PurchaseAnalyticsService
{
    const CACHE_DURATION = 300; // 5 minutes

    /**
     * تحليلات المشتريات الشاملة
     */
    public static function getAnalytics($startDate = null, $endDate = null)
    {
        $cacheKey = 'purchase_analytics_' . md5($startDate . $endDate);
        
        return Cache::remember($cacheKey, self::CACHE_DURATION, function () use ($startDate, $endDate) {
            $query = PurchaseInvoice::query();
            
            if ($startDate) {
                $query->whereDate('created_at', '>=', $startDate);
            }
            if ($endDate) {
                $query->whereDate('created_at', '<=', $endDate);
            }
            
            return [
                'summary' => self::getPurchasesSummary($query),
                'by_supplier' => self::getPurchasesBySupplier($query),
                'by_payment_method' => self::getPurchasesByPaymentMethod($query),
                'by_status' => self::getPurchasesByStatus($query),
                'daily_trend' => self::getDailyTrend($query),
                'monthly_comparison' => self::getMonthlyComparison(),
            ];
        });
    }

    /**
     * ملخص المشتريات
     */
    private static function getPurchasesSummary($query)
    {
        return [
            'total_purchases' => (float) $query->sum('total_amount'),
            'total_invoices' => $query->count(),
            'average_invoice' => (float) $query->avg('total_amount'),
            'total_paid' => (float) $query->sum('paid_amount'),
            'total_remaining' => (float) $query->sum('remaining_amount'),
            'total_discount' => (float) $query->sum('discount'),
            'total_tax' => (float) $query->sum('tax'),
        ];
    }

    /**
     * المشتريات حسب المورد
     */
    private static function getPurchasesBySupplier($query)
    {
        return $query->clone()
            ->join('suppliers', 'purchase_invoices.supplier_id', '=', 'suppliers.id')
            ->select(
                'suppliers.id',
                'suppliers.name',
                'suppliers.name_ar',
                DB::raw('COUNT(purchase_invoices.id) as invoice_count'),
                DB::raw('SUM(purchase_invoices.total_amount) as total_amount'),
                DB::raw('SUM(purchase_invoices.paid_amount) as paid_amount'),
                DB::raw('SUM(purchase_invoices.remaining_amount) as remaining_amount')
            )
            ->groupBy('suppliers.id', 'suppliers.name', 'suppliers.name_ar')
            ->orderByDesc('total_amount')
            ->limit(10)
            ->get();
    }

    /**
     * المشتريات حسب طريقة الدفع
     */
    private static function getPurchasesByPaymentMethod($query)
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
     * المشتريات حسب الحالة
     */
    private static function getPurchasesByStatus($query)
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
            
            $total = PurchaseInvoice::whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->sum('total_amount');
                
            $count = PurchaseInvoice::whereYear('created_at', $date->year)
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
     * أفضل الموردين
     */
    public static function getTopSuppliers($limit = 10)
    {
        return Cache::remember('top_suppliers_' . $limit, self::CACHE_DURATION, function () use ($limit) {
            return Supplier::withCount('purchaseInvoices')
                ->withSum('purchaseInvoices', 'total_amount')
                ->orderByDesc('purchase_invoices_sum_total_amount')
                ->limit($limit)
                ->get()
                ->map(function ($supplier) {
                    return [
                        'id' => $supplier->id,
                        'name' => $supplier->name,
                        'name_ar' => $supplier->name_ar,
                        'invoice_count' => $supplier->purchase_invoices_count,
                        'total_amount' => (float) $supplier->purchase_invoices_sum_total_amount,
                    ];
                });
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
