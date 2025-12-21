<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

/**
 * Attendance Service
 * 
 * يدير منطق الحضور والانصراف
 */
class AttendanceService extends BaseService
{
    /**
     * Get all attendances with filters.
     *
     * @param array $filters
     * @return array
     */
    public function getAll(array $filters = []): array
    {
        try {
            $query = Attendance::with('user:id,name,email,avatar');

            // Filter by user
            if (!empty($filters['user_id'])) {
                $query->forUser($filters['user_id']);
            }

            // Filter by date range
            if (!empty($filters['start_date']) && !empty($filters['end_date'])) {
                $query->dateRange($filters['start_date'], $filters['end_date']);
            }

            // Filter by status
            if (!empty($filters['status'])) {
                $query->byStatus($filters['status']);
            }

            // Order by date desc
            $query->orderBy('date', 'desc');

            $attendances = $query->paginate($filters['per_page'] ?? 15);

            return $this->successResponse($attendances);
        } catch (Exception $e) {
            $this->logError($e, ['filters' => $filters]);
            return $this->errorResponse($this->getArabicErrorMessage($e));
        }
    }

    /**
     * Get attendance by ID.
     *
     * @param int $id
     * @return array
     */
    public function getById(int $id): array
    {
        try {
            $attendance = Attendance::with('user')->findOrFail($id);
            return $this->successResponse($attendance);
        } catch (Exception $e) {
            $this->logError($e, ['id' => $id]);
            return $this->errorResponse('سجل الحضور غير موجود');
        }
    }

    /**
     * Check in user.
     *
     * @param int $userId
     * @param array $data
     * @return array
     */
    public function checkIn(int $userId, array $data = []): array
    {
        try {
            // Validate user exists
            $user = User::findOrFail($userId);

            $today = Carbon::today()->toDateString();

            // Check if already checked in today
            $existingAttendance = Attendance::where('user_id', $userId)
                ->where('date', $today)
                ->first();

            if ($existingAttendance) {
                return $this->errorResponse('تم تسجيل الحضور مسبقاً لهذا اليوم');
            }

            $attendance = $this->executeInTransaction(function () use ($userId, $today, $data) {
                return Attendance::create([
                    'user_id' => $userId,
                    'date' => $today,
                    'check_in' => Carbon::now()->format('H:i:s'),
                    'status' => $data['status'] ?? 'present',
                    'notes' => $data['notes'] ?? null,
                ]);
            });

            return $this->successResponse($attendance, 'تم تسجيل الحضور بنجاح');
        } catch (Exception $e) {
            $this->logError($e, ['user_id' => $userId, 'data' => $data]);
            return $this->errorResponse($this->getArabicErrorMessage($e));
        }
    }

    /**
     * Check out user.
     *
     * @param int $userId
     * @param array $data
     * @return array
     */
    public function checkOut(int $userId, array $data = []): array
    {
        try {
            $today = Carbon::today()->toDateString();

            $attendance = Attendance::where('user_id', $userId)
                ->where('date', $today)
                ->first();

            if (!$attendance) {
                return $this->errorResponse('لم يتم تسجيل الحضور لهذا اليوم');
            }

            if ($attendance->check_out) {
                return $this->errorResponse('تم تسجيل الانصراف مسبقاً');
            }

            $attendance = $this->executeInTransaction(function () use ($attendance, $data) {
                $attendance->update([
                    'check_out' => Carbon::now()->format('H:i:s'),
                    'notes' => $data['notes'] ?? $attendance->notes,
                ]);

                return $attendance->fresh();
            });

            return $this->successResponse($attendance, 'تم تسجيل الانصراف بنجاح');
        } catch (Exception $e) {
            $this->logError($e, ['user_id' => $userId, 'data' => $data]);
            return $this->errorResponse($this->getArabicErrorMessage($e));
        }
    }

    /**
     * Create or update attendance manually.
     *
     * @param array $data
     * @return array
     */
    public function createOrUpdate(array $data): array
    {
        try {
            // Validate data
            $validator = Validator::make($data, [
                'user_id' => 'required|exists:users,id',
                'date' => 'required|date',
                'check_in' => 'nullable|date_format:H:i',
                'check_out' => 'nullable|date_format:H:i|after:check_in',
                'status' => 'required|in:present,absent,late,half_day',
                'notes' => 'nullable|string|max:500',
            ], [
                'user_id.required' => 'الموظف مطلوب',
                'user_id.exists' => 'الموظف غير موجود',
                'date.required' => 'التاريخ مطلوب',
                'date.date' => 'التاريخ غير صالح',
                'check_in.date_format' => 'صيغة وقت الحضور غير صالحة',
                'check_out.date_format' => 'صيغة وقت الانصراف غير صالحة',
                'check_out.after' => 'وقت الانصراف يجب أن يكون بعد وقت الحضور',
                'status.required' => 'الحالة مطلوبة',
                'status.in' => 'الحالة غير صالحة',
                'notes.max' => 'الملاحظات يجب ألا تتجاوز 500 حرف',
            ]);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            $attendance = $this->executeInTransaction(function () use ($data) {
                return Attendance::updateOrCreate(
                    [
                        'user_id' => $data['user_id'],
                        'date' => $data['date'],
                    ],
                    [
                        'check_in' => $data['check_in'] ?? null,
                        'check_out' => $data['check_out'] ?? null,
                        'status' => $data['status'],
                        'notes' => $data['notes'] ?? null,
                    ]
                );
            });

            return $this->successResponse($attendance, 'تم حفظ سجل الحضور بنجاح');
        } catch (ValidationException $e) {
            return $this->errorResponse('بيانات غير صالحة', $e->errors());
        } catch (Exception $e) {
            $this->logError($e, ['data' => $data]);
            return $this->errorResponse($this->getArabicErrorMessage($e));
        }
    }

    /**
     * Delete attendance.
     *
     * @param int $id
     * @return array
     */
    public function delete(int $id): array
    {
        try {
            $attendance = Attendance::findOrFail($id);

            $this->executeInTransaction(function () use ($attendance) {
                $attendance->delete();
            });

            return $this->successResponse(null, 'تم حذف سجل الحضور بنجاح');
        } catch (Exception $e) {
            $this->logError($e, ['id' => $id]);
            return $this->errorResponse('فشل حذف سجل الحضور');
        }
    }

    /**
     * Get attendance statistics for a user.
     *
     * @param int $userId
     * @param string $startDate
     * @param string $endDate
     * @return array
     */
    public function getUserStatistics(int $userId, string $startDate, string $endDate): array
    {
        try {
            $attendances = Attendance::forUser($userId)
                ->dateRange($startDate, $endDate)
                ->get();

            $statistics = [
                'total_days' => $attendances->count(),
                'present_days' => $attendances->where('status', 'present')->count(),
                'absent_days' => $attendances->where('status', 'absent')->count(),
                'late_days' => $attendances->where('status', 'late')->count(),
                'half_days' => $attendances->where('status', 'half_day')->count(),
                'total_work_hours' => $attendances->sum('work_hours'),
                'average_work_hours' => $attendances->avg('work_hours'),
            ];

            return $this->successResponse($statistics);
        } catch (Exception $e) {
            $this->logError($e, ['user_id' => $userId, 'start_date' => $startDate, 'end_date' => $endDate]);
            return $this->errorResponse($this->getArabicErrorMessage($e));
        }
    }
}
