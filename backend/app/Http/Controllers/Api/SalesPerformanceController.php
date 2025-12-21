<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SalesPerformanceService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * Sales Performance Controller
 * 
 * يدير طلبات API الخاصة بأداء المبيعات
 */
class SalesPerformanceController extends Controller
{
    protected SalesPerformanceService $salesPerformanceService;

    public function __construct(SalesPerformanceService $salesPerformanceService)
    {
        $this->salesPerformanceService = $salesPerformanceService;
    }

    /**
     * Get all users performance.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->only(['start_date', 'end_date']);
            $result = $this->salesPerformanceService->getAll($filters);

            return response()->json($result, $result['success'] ? 200 : 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء جلب أداء المبيعات',
            ], 500);
        }
    }

    /**
     * Get user performance.
     *
     * @param Request $request
     * @param int $userId
     * @return JsonResponse
     */
    public function show(Request $request, int $userId): JsonResponse
    {
        try {
            $filters = $request->only(['start_date', 'end_date', 'per_page']);
            $result = $this->salesPerformanceService->getByUser($userId, $filters);

            return response()->json($result, $result['success'] ? 200 : 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء جلب أداء الموظف',
            ], 500);
        }
    }

    /**
     * Get top performers.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function topPerformers(Request $request): JsonResponse
    {
        try {
            $filters = $request->only(['start_date', 'end_date', 'limit']);
            $result = $this->salesPerformanceService->getTopPerformers($filters);

            return response()->json($result, $result['success'] ? 200 : 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء جلب أفضل الموظفين',
            ], 500);
        }
    }

    /**
     * Compare users performance.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function compare(Request $request): JsonResponse
    {
        try {
            $userIds = $request->input('user_ids', []);
            
            if (empty($userIds) || !is_array($userIds)) {
                return response()->json([
                    'success' => false,
                    'message' => 'يجب تحديد معرفات الموظفين للمقارنة',
                ], 400);
            }

            $filters = $request->only(['start_date', 'end_date']);
            $result = $this->salesPerformanceService->compareUsers($userIds, $filters);

            return response()->json($result, $result['success'] ? 200 : 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء مقارنة أداء الموظفين',
            ], 500);
        }
    }
}
