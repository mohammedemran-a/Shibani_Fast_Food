<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics
     * 
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     * 
     * Query Parameters:
     * - period: today, week, month, all, custom (default: all)
     * - start_date: Custom start date (YYYY-MM-DD) - required if period=custom
     * - end_date: Custom end date (YYYY-MM-DD) - required if period=custom
     */
    public function index(\Illuminate\Http\Request $request)
    {
        try {
            // الحصول على الفلتر من الطلب
            $period = $request->query('period', 'all');
            $startDate = $request->query('start_date');
            $endDate = $request->query('end_date');
            
            // التحقق من صحة الفترة
            $validPeriods = ['today', 'week', 'month', 'all', 'custom'];
            if (!in_array($period, $validPeriods)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid period. Must be one of: ' . implode(', ', $validPeriods)
                ], 400);
            }
            
            // التحقق من وجود التواريخ للفترة المخصصة
            if ($period === 'custom' && (!$startDate || !$endDate)) {
                return response()->json([
                    'success' => false,
                    'message' => 'start_date and end_date are required for custom period'
                ], 400);
            }
            
            $stats = DashboardService::getStats($period, $startDate, $endDate);
            
            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Dashboard statistics retrieved successfully'
            ]);
        } catch (\Exception $e) {
            \Log::error('Dashboard Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve dashboard statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
