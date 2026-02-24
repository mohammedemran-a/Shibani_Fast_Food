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

/**
 * خدمة لوحة التحكم
 * 
 * تحتوي على كل المنطق الخاص بحساب الإحصائيات والبيانات
 * اللازمة للوحة التحكم لضمان أن المتحكم يبقى نظيفًا.
 * تم تحسينها للأداء العالي وتجنب مشاكل N+1.
 */
class DashboardService
{
    /**
     * مدة التخزين المؤقت بالثواني (5 دقائق)
     */
    const CACHE_DURATION = 300;

    /**
     * الدالة الرئيسية لتجميع كل إحصائيات لوحة التحكم مع التخزين المؤقت.
     */
    public static function getStats($period = 'all', $start_date = null, $end_date = null)
    {
        $cacheKey = 'dashboard_stats_' . $period . '_' . $start_date . '_' . $end_date;
        
        return Cache::remember($cacheKey, self::CACHE_DURATION, function () use ($period, $start_date, $end_date) {
            
            [$from, $to] = self::getDateRange($period, $start_date, $end_date);
            
            $salesStats = self::getSalesStats($from, $to);
            $purchasesStats = self::getPurchasesStats($from, $to);
            $expensesStats = self::getExpensesStats($from, $to);
            $productStats = self::getProductStats();
            $peopleStats = self::getPeopleStats();
            $profitStats = self::getProfitStats($from, $to, $expensesStats);
            $smartInsights = self::getSmartInsights($productStats, $profitStats);

            return [
                'sales' => $salesStats,
                'purchases' => $purchasesStats,
                'products' => $productStats,
                'people' => $peopleStats,
                'profit' => $profitStats,
                'expenses' => $expensesStats,
                'top_products' => self::getTopProducts($from, $to),
                'sales_chart_data' => self::getSalesChartData($from, $to),
                'smart_insights' => $smartInsights,
                'recent_sales' => self::getRecentSales($from, $to),
                'last_updated' => now()->toDateTimeString(),
            ];
        });
    }

    /**
     * حساب إحصائيات المبيعات.
     */
    private static function getSalesStats(?Carbon $from, ?Carbon $to): array
    {
        $query = SalesInvoice::query();
        if ($from && $to) {
            $query->whereBetween('invoice_date', [$from, $to]);
        }
        
        $result = $query->select(
            DB::raw('SUM(total_amount) as total'),
            DB::raw('COUNT(id) as count')
        )->first();

        return [
            'total' => (float) ($result->total ?? 0),
            'count' => (int) ($result->count ?? 0),
        ];
    }

    /**
     * حساب إحصائيات المشتريات.
     */
    private static function getPurchasesStats(?Carbon $from, ?Carbon $to): array
    {
        $query = PurchaseInvoice::query();
        if ($from && $to) {
            $query->whereBetween('invoice_date', [$from, $to]);
        }
        
        $result = $query->select(
            DB::raw('SUM(total_amount) as total'),
            DB::raw('COUNT(id) as count')
        )->first();

        return [
            'total' => (float) ($result->total ?? 0),
            'count' => (int) ($result->count ?? 0),
        ];
    }

    /**
     * حساب إحصائيات المصروفات.
     */
    private static function getExpensesStats(?Carbon $from, ?Carbon $to): array
    {
        $query = Expense::query();
        if ($from && $to) {
            $query->whereBetween('date', [$from, $to]);
        }
        
        $result = $query->select(
            DB::raw('SUM(amount) as total'),
            DB::raw('COUNT(id) as count')
        )->first();

        return [
            'total' => (float) ($result->total ?? 0),
            'count' => (int) ($result->count ?? 0),
        ];
    }

    /**
     * حساب الأرباح الحقيقية من الفواتير والمصروفات.
     */
    private static function getProfitStats(?Carbon $from, ?Carbon $to, array $expensesStats): array
    {
        $query = DB::table('sales_invoices')
            ->join('sales_invoice_items', 'sales_invoices.id', '=', 'sales_invoice_items.sales_invoice_id');

        if ($from && $to) {
            $query->whereBetween('sales_invoices.invoice_date', [$from, $to]);
        }

        $grossProfitResult = $query->select(
            DB::raw('SUM(sales_invoice_items.quantity * (sales_invoice_items.unit_price - sales_invoice_items.purchase_price)) as total_profit'),
            DB::raw('SUM(sales_invoice_items.quantity * sales_invoice_items.unit_price) as total_revenue')
        )->first();

        $totalProfit = (float) ($grossProfitResult->total_profit ?? 0);
        $totalRevenue = (float) ($grossProfitResult->total_revenue ?? 0);
        $netProfit = $totalProfit - $expensesStats['total'];
        $margin = $totalRevenue > 0 ? ($totalProfit / $totalRevenue) * 100 : 0;

        return [
            'total' => $totalProfit,
            'net_profit' => $netProfit,
            'margin' => $margin,
        ];
    }

    /**
     * إحصائيات المنتجات (لا تعتمد على التاريخ).
     */
    private static function getProductStats(): array
    {
        return [
            'total_count' => Product::count(),
            'low_stock_count' => Product::whereColumn('quantity', '<=', 'reorder_level')->count(),
        ];
    }

    /**
     * إحصائيات الأشخاص (لا تعتمد على التاريخ).
     */
    private static function getPeopleStats(): array
    {
        return [
            'customers_count' => Customer::count(),
            'active_customers' => Customer::where('is_active', true)->count(),
            'suppliers_count' => Supplier::count(),
            'active_suppliers' => Supplier::where('is_active', true)->count(),
        ];
    }

    /**
     * توليد رؤى ذكية بناءً على البيانات.
     */
    private static function getSmartInsights(array $productStats, array $profitStats): array
    {
        $insights = [];

        if ($productStats['low_stock_count'] > 0) {
            $insights[] = [
                'id' => 'low_stock',
                'type' => 'warning',
                'title' => 'تنبيه المخزون المنخفض',
                'description' => "لديك {$productStats['low_stock_count']} منتجًا وصل إلى حد إعادة الطلب. قم بمراجعة المخزون.",
            ];
        }

        if ($profitStats['margin'] < 15 && $profitStats['margin'] > 0) {
            $insights[] = [
                'id' => 'low_margin',
                'type' => 'warning',
                'title' => 'هامش ربح منخفض',
                'description' => "هامش الربح الإجمالي حاليًا هو " . round($profitStats['margin'], 1) . "%. قد تحتاج لمراجعة أسعارك.",
            ];
        } elseif ($profitStats['margin'] > 40) {
            $insights[] = [
                'id' => 'high_margin',
                'type' => 'success',
                'title' => 'هامش ربح ممتاز',
                'description' => "أداء رائع! هامش الربح الإجمالي هو " . round($profitStats['margin'], 1) . "%.",
            ];
        }

        if (empty($insights)) {
            $insights[] = [
                'id' => 'all_good',
                'type' => 'info',
                'title' => 'كل شيء على ما يرام',
                'description' => 'لا توجد تنبيهات هامة في الوقت الحالي. استمر في العمل الجيد!',
            ];
        }

        return $insights;
    }

    /**
     * تجميع بيانات الرسم البياني للمبيعات باستعلام واحد.
     */
    private static function getSalesChartData(?Carbon $from, ?Carbon $to): array
    {
        if (!$from || !$to) {
            $to = Carbon::now()->endOfDay();
            $from = Carbon::now()->subDays(6)->startOfDay();
        }

        $dateFormat = ($to->diffInDays($from) > 31) ? '%Y-%m' : '%Y-%m-%d';

        return SalesInvoice::whereBetween('invoice_date', [$from, $to])
            ->select(
                DB::raw("DATE_FORMAT(invoice_date, '$dateFormat') as date"),
                DB::raw('SUM(total_amount) as total_sales')
            )
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get()
            ->toArray();
    }

    /**
     * أفضل 5 منتجات مبيعًا.
     */
    private static function getTopProducts(?Carbon $from, ?Carbon $to, int $limit = 5): array
    {
        $query = DB::table('sales_invoice_items')
            ->join('products', 'sales_invoice_items.product_id', '=', 'products.id')
            ->join('sales_invoices', 'sales_invoice_items.sales_invoice_id', '=', 'sales_invoices.id');
        
        if ($from && $to) {
            $query->whereBetween('sales_invoices.invoice_date', [$from, $to]);
        }
        
        return $query->select(
                'products.name',
                'products.image',
                DB::raw('SUM(sales_invoice_items.quantity) as total_quantity_sold')
            )
            ->groupBy('products.id', 'products.name', 'products.image')
            ->orderByDesc('total_quantity_sold')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    /**
     * جلب آخر المبيعات.
     */
    private static function getRecentSales(?Carbon $from, ?Carbon $to, int $limit = 5): array
    {
        $query = SalesInvoice::with('customer:id,name');
        if ($from && $to) {
            $query->whereBetween('invoice_date', [$from, $to]);
        }
        return $query->select('id', 'invoice_number', 'customer_id', 'total_amount', 'status', 'invoice_date')
            ->orderByDesc('invoice_date')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    /**
     * دالة مساعدة لتحديد نطاق التاريخ.
     */
    private static function getDateRange(string $period, ?string $startDate, ?string $endDate): array
    {
        if ($period === 'custom' && $startDate && $endDate) {
            return [Carbon::parse($startDate)->startOfDay(), Carbon::parse($endDate)->endOfDay()];
        }
        
        $to = Carbon::now()->endOfDay();
        
        switch ($period) {
            case 'today':
                $from = Carbon::now()->startOfDay();
                break;
            case 'week':
                $from = Carbon::now()->startOfWeek();
                break;
            case 'month':
                $from = Carbon::now()->startOfMonth();
                break;
            case 'all':
            default:
                return [null, null]; // إرجاع null للتعامل مع كل السجلات
        }
        return [$from, $to];
    }
}
