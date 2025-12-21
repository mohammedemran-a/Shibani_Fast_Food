<?php

namespace App\Services;

use App\Models\User;
use App\Models\SalesInvoice;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\DB;

/**
 * Sales Performance Service
 * 
 * يدير منطق أداء المبيعات للموظفين
 */
class SalesPerformanceService extends BaseService
{
    /**
     * Get sales performance for all users.
     *
     * @param array $filters
     * @return array
     */
    public function getAll(array $filters = []): array
    {
        try {
            $startDate = $filters['start_date'] ?? Carbon::now()->startOfMonth()->toDateString();
            $endDate = $filters['end_date'] ?? Carbon::now()->endOfMonth()->toDateString();

            $users = User::with('role')
                ->where('is_active', true)
                ->get();

            $performance = $users->map(function ($user) use ($startDate, $endDate) {
                return $this->calculateUserPerformance($user, $startDate, $endDate);
            });

            // Sort by total sales desc
            $performance = $performance->sortByDesc('total_sales')->values();

            return $this->successResponse($performance);
        } catch (Exception $e) {
            $this->logError($e, ['filters' => $filters]);
            return $this->errorResponse($this->getArabicErrorMessage($e));
        }
    }

    /**
     * Get sales performance for specific user.
     *
     * @param int $userId
     * @param array $filters
     * @return array
     */
    public function getByUser(int $userId, array $filters = []): array
    {
        try {
            $user = User::findOrFail($userId);

            $startDate = $filters['start_date'] ?? Carbon::now()->startOfMonth()->toDateString();
            $endDate = $filters['end_date'] ?? Carbon::now()->endOfMonth()->toDateString();

            $performance = $this->calculateUserPerformance($user, $startDate, $endDate);

            // Get detailed invoices
            $invoices = SalesInvoice::where('cashier_id', $userId)
                ->whereBetween('invoice_date', [$startDate, $endDate])
                ->with('customer:id,name')
                ->orderBy('invoice_date', 'desc')
                ->paginate($filters['per_page'] ?? 15);

            $performance['invoices'] = $invoices;

            return $this->successResponse($performance);
        } catch (Exception $e) {
            $this->logError($e, ['user_id' => $userId, 'filters' => $filters]);
            return $this->errorResponse($this->getArabicErrorMessage($e));
        }
    }

    /**
     * Calculate user performance.
     *
     * @param User $user
     * @param string $startDate
     * @param string $endDate
     * @return array
     */
    private function calculateUserPerformance(User $user, string $startDate, string $endDate): array
    {
        $invoices = SalesInvoice::where('cashier_id', $user->id)
            ->whereBetween('invoice_date', [$startDate, $endDate])
            ->get();

        $totalSales = $invoices->sum('total_amount');
        $totalProfit = $invoices->sum('profit');
        $totalInvoices = $invoices->count();
        $averageInvoiceValue = $totalInvoices > 0 ? $totalSales / $totalInvoices : 0;

        // Calculate daily average
        $days = Carbon::parse($startDate)->diffInDays(Carbon::parse($endDate)) + 1;
        $dailyAverage = $days > 0 ? $totalSales / $days : 0;

        return [
            'user_id' => $user->id,
            'user_name' => $user->name,
            'user_email' => $user->email,
            'user_avatar' => $user->avatar,
            'role_name' => $user->role->name ?? null,
            'total_sales' => round($totalSales, 2),
            'total_profit' => round($totalProfit, 2),
            'total_invoices' => $totalInvoices,
            'average_invoice_value' => round($averageInvoiceValue, 2),
            'daily_average' => round($dailyAverage, 2),
            'profit_margin' => $totalSales > 0 ? round(($totalProfit / $totalSales) * 100, 2) : 0,
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'days' => $days,
            ],
        ];
    }

    /**
     * Get top performers.
     *
     * @param array $filters
     * @return array
     */
    public function getTopPerformers(array $filters = []): array
    {
        try {
            $startDate = $filters['start_date'] ?? Carbon::now()->startOfMonth()->toDateString();
            $endDate = $filters['end_date'] ?? Carbon::now()->endOfMonth()->toDateString();
            $limit = $filters['limit'] ?? 10;

            $topPerformers = DB::table('sales_invoices')
                ->select(
                    'users.id',
                    'users.name',
                    'users.email',
                    'users.avatar',
                    DB::raw('COUNT(*) as total_invoices'),
                    DB::raw('SUM(sales_invoices.total_amount) as total_sales'),
                    DB::raw('SUM(sales_invoices.profit) as total_profit')
                )
                ->join('users', 'sales_invoices.cashier_id', '=', 'users.id')
                ->whereBetween('sales_invoices.invoice_date', [$startDate, $endDate])
                ->where('users.is_active', true)
                ->groupBy('users.id', 'users.name', 'users.email', 'users.avatar')
                ->orderBy('total_sales', 'desc')
                ->limit($limit)
                ->get();

            return $this->successResponse($topPerformers);
        } catch (Exception $e) {
            $this->logError($e, ['filters' => $filters]);
            return $this->errorResponse($this->getArabicErrorMessage($e));
        }
    }

    /**
     * Get sales comparison between users.
     *
     * @param array $userIds
     * @param array $filters
     * @return array
     */
    public function compareUsers(array $userIds, array $filters = []): array
    {
        try {
            $startDate = $filters['start_date'] ?? Carbon::now()->startOfMonth()->toDateString();
            $endDate = $filters['end_date'] ?? Carbon::now()->endOfMonth()->toDateString();

            $comparison = [];

            foreach ($userIds as $userId) {
                $user = User::find($userId);
                if ($user) {
                    $comparison[] = $this->calculateUserPerformance($user, $startDate, $endDate);
                }
            }

            return $this->successResponse($comparison);
        } catch (Exception $e) {
            $this->logError($e, ['user_ids' => $userIds, 'filters' => $filters]);
            return $this->errorResponse($this->getArabicErrorMessage($e));
        }
    }
}
