<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SalesAnalyticsService;
use App\Services\PurchaseAnalyticsService;
use App\Services\ProductAnalyticsService;
use App\Services\DashboardService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

// =================================================================
// **1. إضافة استيراد الخدمة الجديدة**
// =================================================================
use App\Services\BasketAnalyticsService;

/**
 * API Controller for handling analytics requests.
 * This controller acts as a bridge between HTTP requests and the dedicated analytics services.
 */
class AnalyticsController extends Controller
{
    /**
     * Get sales analytics.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function sales(Request $request)
    {
        try {
            $options = $request->validate([
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
            ]);
            
            $analytics = SalesAnalyticsService::getAnalytics($options['start_date'] ?? null, $options['end_date'] ?? null);
            
            return response()->json([
                'success' => true,
                'data' => $analytics,
                'message' => 'Sales analytics retrieved successfully'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid input provided.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Sales Analytics Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve sales analytics',
            ], 500);
        }
    }

    /**
     * Get purchase analytics.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function purchases(Request $request)
    {
        try {
            $options = $request->validate([
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date|after_or_equal:start_date',
            ]);

            $analytics = PurchaseAnalyticsService::getAnalytics($options['start_date'] ?? null, $options['end_date'] ?? null);
            
            return response()->json([
                'success' => true,
                'data' => $analytics,
                'message' => 'Purchase analytics retrieved successfully'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid input provided.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Purchase Analytics Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve purchase analytics',
            ], 500);
        }
    }

    /**
     * Get advanced product performance analytics.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function products(Request $request)
    {
        try {
            $validatedOptions = $request->validate([
                'startDate' => 'nullable|date',
                'endDate' => 'nullable|date|after_or_equal:startDate',
                'limit' => 'nullable|integer|min:1|max:100',
                'categoryId' => 'nullable|integer|exists:categories,id',
                'brandId' => 'nullable|integer|exists:brands,id',
            ]);

            $analytics = ProductAnalyticsService::getAnalytics($validatedOptions);
            
            return response()->json([
                'success' => true,
                'data' => $analytics,
                'message' => 'Product performance analytics retrieved successfully.'
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid filter options provided.',
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            Log::error('Product Analytics Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'An unexpected error occurred while retrieving product analytics.'
            ], 500);
        }
    }

    // =================================================================
    // **2. إضافة الدالة الجديدة هنا**
    // =================================================================
    /**
     * Get basket analysis data to find product associations.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function basketAnalysis(Request $request)
    {
        try {
            // التحقق من صحة معاملات الطلب
            $validatedOptions = $request->validate([
                'startDate' => 'nullable|date',
                'endDate' => 'nullable|date|after_or_equal:startDate',
                'limit' => 'nullable|integer|min:1|max:100',
                'minSupport' => 'nullable|integer|min:1',
            ]);

            // استدعاء الخدمة مع الخيارات التي تم التحقق منها
            $pairs = BasketAnalyticsService::findProductPairs($validatedOptions);
            
            return response()->json([
                'success' => true,
                'data' => $pairs,
                'message' => 'Basket analysis retrieved successfully'
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid filter options provided.',
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            Log::error('Basket Analysis Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'An unexpected error occurred while retrieving basket analysis.'
            ], 500);
        }
    }

    /**
     * Get top customers.
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
            Log::error('Top Customers Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve top customers',
            ], 500);
        }
    }

    /**
     * Get top suppliers.
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
            Log::error('Top Suppliers Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve top suppliers',
            ], 500);
        }
    }

    /**
     * Get product movement report.
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
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
             return response()->json([
                'success' => false,
                'message' => 'Product not found.',
            ], 404);
        } catch (\Exception $e) {
            Log::error('Product Movement Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve product movement',
            ], 500);
        }
    }

    /**
     * Clear all analytics cache.
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
                'message' => 'Analytics cache cleared successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Clear Cache Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear cache',
            ], 500);
        }
    }

    /**
     * Refresh dashboard cache.
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
            Log::error('Refresh Cache Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to refresh cache',
            ], 500);
        }
    }
}
