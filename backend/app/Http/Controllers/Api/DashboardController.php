<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use App\Services\SalesAnalyticsService;
use App\Services\PurchaseAnalyticsService;
use App\Services\ProductAnalyticsService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        try {
            $stats = DashboardService::getStats();
            
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

    /**
     * Get sales analytics
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function salesAnalytics(Request $request)
    {
        try {
            $startDate = $request->input('start_date');
            $endDate = $request->input('end_date');
            
            $analytics = SalesAnalyticsService::getAnalytics($startDate, $endDate);
            
            return response()->json([
                'success' => true,
                'data' => $analytics,
                'message' => 'Sales analytics retrieved successfully'
            ]);
        } catch (\Exception $e) {
            \Log::error('Sales Analytics Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve sales analytics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get purchase analytics
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function purchaseAnalytics(Request $request)
    {
        try {
            $startDate = $request->input('start_date');
            $endDate = $request->input('end_date');
            
            $analytics = PurchaseAnalyticsService::getAnalytics($startDate, $endDate);
            
            return response()->json([
                'success' => true,
                'data' => $analytics,
                'message' => 'Purchase analytics retrieved successfully'
            ]);
        } catch (\Exception $e) {
            \Log::error('Purchase Analytics Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve purchase analytics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get product analytics
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function productAnalytics()
    {
        try {
            $analytics = ProductAnalyticsService::getAnalytics();
            
            return response()->json([
                'success' => true,
                'data' => $analytics,
                'message' => 'Product analytics retrieved successfully'
            ]);
        } catch (\Exception $e) {
            \Log::error('Product Analytics Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve product analytics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get top customers
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function topCustomers(Request $request)
    {
        try {
            $limit = $request->input('limit', 10);
            $customers = SalesAnalyticsService::getTopCustomers($limit);
            
            return response()->json([
                'success' => true,
                'data' => $customers,
                'message' => 'Top customers retrieved successfully'
            ]);
        } catch (\Exception $e) {
            \Log::error('Top Customers Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve top customers',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get top suppliers
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function topSuppliers(Request $request)
    {
        try {
            $limit = $request->input('limit', 10);
            $suppliers = PurchaseAnalyticsService::getTopSuppliers($limit);
            
            return response()->json([
                'success' => true,
                'data' => $suppliers,
                'message' => 'Top suppliers retrieved successfully'
            ]);
        } catch (\Exception $e) {
            \Log::error('Top Suppliers Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve top suppliers',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get product movement report
     * 
     * @param int $productId
     * @return \Illuminate\Http\JsonResponse
     */
    public function productMovement($productId)
    {
        try {
            $movement = ProductAnalyticsService::getProductMovement($productId);
            
            return response()->json([
                'success' => true,
                'data' => $movement,
                'message' => 'Product movement retrieved successfully'
            ]);
        } catch (\Exception $e) {
            \Log::error('Product Movement Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve product movement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clear dashboard cache
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function clearCache()
    {
        try {
            DashboardService::clearCache();
            SalesAnalyticsService::clearCache();
            PurchaseAnalyticsService::clearCache();
            ProductAnalyticsService::clearCache();
            
            return response()->json([
                'success' => true,
                'message' => 'Cache cleared successfully'
            ]);
        } catch (\Exception $e) {
            \Log::error('Clear Cache Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear cache',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Refresh dashboard cache
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function refreshCache()
    {
        try {
            $stats = DashboardService::refreshCache();
            
            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Cache refreshed successfully'
            ]);
        } catch (\Exception $e) {
            \Log::error('Refresh Cache Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to refresh cache',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
