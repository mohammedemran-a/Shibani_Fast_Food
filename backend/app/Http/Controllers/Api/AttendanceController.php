<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AttendanceService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * Attendance Controller
 * 
 * يدير طلبات API الخاصة بالحضور والانصراف
 */
class AttendanceController extends Controller
{
    protected AttendanceService $attendanceService;

    public function __construct(AttendanceService $attendanceService)
    {
        $this->attendanceService = $attendanceService;
    }

    /**
     * Get all attendances.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->only(['user_id', 'start_date', 'end_date', 'status', 'per_page']);
            $result = $this->attendanceService->getAll($filters);

            return response()->json($result, $result['success'] ? 200 : 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء جلب سجلات الحضور',
            ], 500);
        }
    }

    /**
     * Get attendance by ID.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        try {
            $result = $this->attendanceService->getById($id);

            return response()->json($result, $result['success'] ? 200 : 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء جلب سجل الحضور',
            ], 500);
        }
    }

    /**
     * Check in user.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function checkIn(Request $request): JsonResponse
    {
        try {
            $userId = $request->input('user_id') ?? auth()->id();
            $result = $this->attendanceService->checkIn($userId, $request->all());

            return response()->json($result, $result['success'] ? 201 : 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء تسجيل الحضور',
            ], 500);
        }
    }

    /**
     * Check out user.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function checkOut(Request $request): JsonResponse
    {
        try {
            $userId = $request->input('user_id') ?? auth()->id();
            $result = $this->attendanceService->checkOut($userId, $request->all());

            return response()->json($result, $result['success'] ? 200 : 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء تسجيل الانصراف',
            ], 500);
        }
    }

    /**
     * Create or update attendance.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $result = $this->attendanceService->createOrUpdate($request->all());

            return response()->json($result, $result['success'] ? 201 : 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء حفظ سجل الحضور',
            ], 500);
        }
    }

    /**
     * Delete attendance.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $result = $this->attendanceService->delete($id);

            return response()->json($result, $result['success'] ? 200 : 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء حذف سجل الحضور',
            ], 500);
        }
    }

    /**
     * Get user statistics.
     *
     * @param Request $request
     * @param int $userId
     * @return JsonResponse
     */
    public function statistics(Request $request, int $userId): JsonResponse
    {
        try {
            $startDate = $request->input('start_date');
            $endDate = $request->input('end_date');

            if (!$startDate || !$endDate) {
                return response()->json([
                    'success' => false,
                    'message' => 'تاريخ البداية والنهاية مطلوبان',
                ], 400);
            }

            $result = $this->attendanceService->getUserStatistics($userId, $startDate, $endDate);

            return response()->json($result, $result['success'] ? 200 : 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء جلب إحصائيات الحضور',
            ], 500);
        }
    }
}
