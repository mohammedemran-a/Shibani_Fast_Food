<?php

namespace App\Services;

use App\Models\PurchaseInvoice;
use App\Models\Supplier;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * ✅ خدمة تحليلات المشتريات (النسخة النهائية والمحدثة)
 */
class PurchaseAnalyticsService
{
    const CACHE_DURATION = 300; // 5 دقائق

    /**
     * تحليلات المشتريات الشاملة
     */
    public static function getAnalytics($startDate = null, $endDate = null)
    {
        $cacheKey = 'purchase_analytics_' . md5($startDate . $endDate);
        
        return Cache::remember($cacheKey, self::CACHE_DURATION, function () use ($startDate, $endDate) {
            $query = PurchaseInvoice::query();
            
            if ($startDate) {
                $query->whereDate('invoice_date', '>=', $startDate);
            }
            if ($endDate) {
                $query->whereDate('invoice_date', '<=', $endDate);
            }
            
            return [
                'summary' => self::getPurchasesSummary($query),
                'by_supplier' => self::getTopSuppliers($query, 10),
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
        // ✅ [تعديل] استخدام selectRaw لتجميع البيانات بكفاءة
        $summary = $query->clone()->selectRaw(
            'COUNT(id) as total_invoices,
             SUM(total_amount) as total_purchases,
             AVG(total_amount) as average_invoice,
             SUM(paid_amount) as total_paid,
             SUM(total_amount - paid_amount) as total_remaining,
             SUM(discount_amount) as total_discount,
             SUM(tax_amount) as total_tax'
        )->first();

        return [
            'total_invoices' => (int) $summary->total_invoices,
            'total_purchases' => (float) $summary->total_purchases,
            'average_invoice' => (float) $summary->average_invoice,
            'total_paid' => (float) $summary->total_paid,
            'total_remaining' => (float) $summary->total_remaining,
            'total_discount' => (float) $summary->total_discount,
            'total_tax' => (float) $summary->total_tax,
        ];
    }

    /**
     * ✅ [تعديل] المشتريات حسب المورد (أفضل الموردين)
     */
    private static function getTopSuppliers($query, $limit = 10)
    {
        // استخدام علاقات Eloquent بدلاً من join يدوي
        return Supplier::whereHas('purchaseInvoices', function ($q) use ($query) {
            $q->whereIn('id', $query->clone()->pluck('id'));
        })
        ->withCount(['purchaseInvoices' => function ($q) use ($query) {
            $q->whereIn('id', $query->clone()->pluck('id'));
        }])
        ->withSum(['purchaseInvoices' => function ($q) use ($query) {
            $q->whereIn('id', $query->clone()->pluck('id'));
        }], 'total_amount')
        ->orderByDesc('purchase_invoices_sum_total_amount')
        ->limit($limit)
        ->get()
        ->map(fn ($supplier) => [
            'id' => $supplier->id,
            'name' => $supplier->name,
            'invoice_count' => $supplier->purchase_invoices_count,
            'total_amount' => (float) $supplier->purchase_invoices_sum_total_amount,
        ]);
    }

    /**
     * المشتريات حسب الحالة
     */
    private static function getPurchasesByStatus($query)
    {
        return $query->clone()
            ->select('status', DB::raw('COUNT(*) as count'), DB::raw('SUM(total_amount) as total'))
            ->groupBy('status')
            ->get();
    }

    /**
     * الاتجاه اليومي
     */
    private static function getDailyTrend($query)
    {
        return $query->clone()
            ->select(DB::raw('DATE(invoice_date) as date'), DB::raw('SUM(total_amount) as total'))
            ->groupBy('date')
            ->orderBy('date', 'asc') // ✅ من الأفضل أن يكون تصاعديًا للرسم البياني
            ->limit(30)
            ->get();
    }

    /**
     * ✅ [تعديل] مقارنة شهرية (باستعلام واحد)
     */
    private static function getMonthlyComparison()
    {
        $endDate = Carbon::now();
        $startDate = Carbon::now()->subMonths(5)->startOfMonth();

        return PurchaseInvoice::whereBetween('invoice_date', [$startDate, $endDate])
            ->select(
                DB::raw("DATE_FORMAT(invoice_date, '%Y-%m') as month"),
                DB::raw('SUM(total_amount) as total'),
                DB::raw('COUNT(id) as count')
            )
            ->groupBy('month')
            ->orderBy('month', 'asc')
            ->get();
    }

    /**
     * مسح الـ Cache
     */
    public static function clearCache()
    {
        // مسح الـ cache المتعلق بهذه الخدمة فقط
        Cache::forget('purchase_analytics_*');
        Cache::forget('top_suppliers_*');
    }
}
