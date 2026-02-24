<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

/**
 * متحكم لوحة التحكم
 * 
 * نقطة الدخول لجلب جميع الإحصائيات والبيانات اللازمة
 * لعرض لوحة التحكم الرئيسية.
 */
class DashboardController extends Controller
{
    /**
     * جلب إحصائيات لوحة التحكم.
     */
    public function index(Request $request)
    {
        try {
            $validated = $request->validate([
                'period' => 'sometimes|in:today,week,month,all,custom',
                'start_date' => 'required_if:period,custom|date_format:Y-m-d',
                'end_date' => 'required_if:period,custom|date_format:Y-m-d|after_or_equal:start_date',
            ]);

            $period = $validated['period'] ?? 'all';
            $startDate = $validated['start_date'] ?? null;
            $endDate = $validated['end_date'] ?? null;
            
            // استدعاء الخدمة من ملفها المنفصل
            $stats = DashboardService::getStats($period, $startDate, $endDate);
            
            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'تم جلب إحصائيات لوحة التحكم بنجاح'
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات الإدخال غير صالحة',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            // تسجيل الخطأ بالتفصيل للمساعدة في التشخيص
            Log::error('خطأ في لوحة التحكم: ' . $e->getMessage() . ' في الملف: ' . $e->getFile() . ' على السطر: ' . $e->getLine());
            
            return response()->json([
                'success' => false,
                'message' => 'فشل في جلب إحصائيات لوحة التحكم (خطأ في الخادم)',
            ], 500);
        }
    }
}
