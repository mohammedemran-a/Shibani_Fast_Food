<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AttendanceService; // سنفترض أنك ستعدل هذا أيضًا
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Attendance; // <-- استيراد النموذج مباشرة للعمليات السريعة
use App\Models\Employee; // <-- استيراد نموذج الموظف

/**
 * Attendance Controller
 * 
 * يدير طلبات API الخاصة بالحضور والانصراف
 */
class AttendanceController extends Controller
{
    // ملاحظة: إذا كنت تستخدم AttendanceService، يجب تعديله أيضًا.
    // سأقوم بكتابة المنطق هنا مباشرة ليكون واضحًا.

    /**
     * Get all attendances.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Attendance::with('employee.user:id,name'); // جلب الموظف والمستخدم

        if ($request->employee_id) { // <-- تعديل: الفلترة بـ employee_id
            $query->where('employee_id', $request->employee_id);
        }
        if ($request->start_date && $request->end_date) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }
        if ($request->status) {
            $query->where('status', $request->status);
        }

        $attendances = $query->latest('date')->paginate($request->per_page ?? 15);

        return response()->json($attendances);
    }

    /**
     * [جديد] تسجيل حضور للمستخدم الحالي.
     */
    public function checkIn(Request $request): JsonResponse
    {
        $user = $request->user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json(['message' => 'حسابك غير مرتبط بسجل موظف.'], 403);
        }

        $today = now()->format('Y-m-d');
        $now = now()->format('H:i:s');

        // البحث عن سجل اليوم أو إنشاء واحد جديد
        $attendance = Attendance::firstOrCreate(
            [
                'employee_id' => $employee->id,
                'date' => $today,
            ],
            [
                'check_in' => $now,
                'status' => 'present', // يمكن تعديل الحالة لاحقًا إذا كان متأخرًا
            ]
        );

        // إذا كان السجل موجودًا بالفعل ولديه check_in، لا تفعل شيئًا
        if (!$attendance->wasRecentlyCreated && $attendance->check_in) {
            return response()->json(['message' => 'لقد قمت بتسجيل الحضور بالفعل لهذا اليوم.'], 409);
        }

        // إذا كان السجل موجودًا ولكن بدون check_in (مثلاً تم إنشاؤه كـ absent)
        if (!$attendance->wasRecentlyCreated) {
            $attendance->update(['check_in' => $now, 'status' => 'present']);
        }

        return response()->json(['message' => 'تم تسجيل الحضور بنجاح.', 'data' => $attendance], 200);
    }

    /**
     * [جديد] تسجيل انصراف للمستخدم الحالي.
     */
    public function checkOut(Request $request): JsonResponse
    {
        $user = $request->user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json(['message' => 'حسابك غير مرتبط بسجل موظف.'], 403);
        }

        $today = now()->format('Y-m-d');
        $now = now()->format('H:i:s');

        $attendance = Attendance::where('employee_id', $employee->id)
            ->where('date', $today)
            ->whereNotNull('check_in')
            ->whereNull('check_out')
            ->first();

        if (!$attendance) {
            return response()->json(['message' => 'لا يوجد تسجيل حضور مفتوح لهذا اليوم لتسجيل الانصراف.'], 404);
        }

        $attendance->update(['check_out' => $now]);

        return response()->json(['message' => 'تم تسجيل الانصراف بنجاح.', 'data' => $attendance], 200);
    }

    /**
     * إنشاء أو تحديث سجل حضور (للمدير).
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'date' => 'required|date',
            'check_in' => 'nullable|date_format:H:i',
            'check_out' => 'nullable|date_format:H:i|after:check_in',
            'status' => 'required|in:present,absent,late,half_day',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $attendance = Attendance::updateOrCreate(
            [
                'employee_id' => $request->employee_id,
                'date' => $request->date,
            ],
            $validator->validated()
        );

        return response()->json(['message' => 'تم حفظ سجل الحضور بنجاح.', 'data' => $attendance], 200);
    }

    /**
     * حذف سجل حضور.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $attendance = Attendance::findOrFail($id);
            $attendance->delete();
            return response()->json(['message' => 'تم حذف سجل الحضور بنجاح.'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'السجل غير موجود.'], 404);
        }
    }

    /**
     * [تعديل] Get employee statistics.
     */
    public function statistics(Request $request, int $employeeId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $stats = Attendance::where('employee_id', $employeeId)
            ->whereBetween('date', [$request->start_date, $request->end_date])
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $totalWorkMinutes = Attendance::where('employee_id', $employeeId)
            ->whereBetween('date', [$request->start_date, $request->end_date])
            ->sum('work_hours');

        $hours = floor($totalWorkMinutes / 60);
        $minutes = $totalWorkMinutes % 60;
        $formattedTotalHours = sprintf('%d:%02d', $hours, $minutes);

        return response()->json([
            'success' => true,
            'data' => [
                'present' => $stats->get('present', 0),
                'absent' => $stats->get('absent', 0),
                'late' => $stats->get('late', 0),
                'half_day' => $stats->get('half_day', 0),
                'total_work_hours' => $formattedTotalHours,
            ]
        ]);
    }
}
