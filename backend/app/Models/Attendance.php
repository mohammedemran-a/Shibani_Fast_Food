<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Attendance extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'employee_id', // <-- تعديل: من user_id إلى employee_id
        'date',
        'check_in',
        'check_out',
        'work_hours',
        'status',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'date' => 'date',
        // ملاحظة: لا نستخدم datetime هنا لأن الحقل من نوع time
        // 'check_in' => 'datetime:H:i',
        // 'check_out' => 'datetime:H:i',
        'work_hours' => 'integer',
    ];

    /**
     * [تعديل] علاقة سجل الحضور بالموظف.
     */
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * [جديد] الوصول إلى بيانات المستخدم بسهولة من خلال الموظف.
     */
    public function user()
    {
        return $this->hasOneThrough(User::class, Employee::class, 'id', 'id', 'employee_id', 'user_id');
    }

    /**
     * Calculate work hours in minutes.
     */
    public function calculateWorkHours(): ?int
    {
        if (!$this->check_in || !$this->check_out) {
            return null;
        }

        // استخدام التاريخ الحالي مع الوقت لإنشاء كائن Carbon صحيح
        $checkIn = Carbon::parse($this->date->toDateString() . ' ' . $this->check_in);
        $checkOut = Carbon::parse($this->date->toDateString() . ' ' . $this->check_out);

        // إذا كان وقت الخروج في اليوم التالي
        if ($checkOut->lessThan($checkIn)) {
            $checkOut->addDay();
        }

        return $checkOut->diffInMinutes($checkIn);
    }

    /**
     * Auto-calculate work hours before saving.
     */
    protected static function booted()
    {
        static::saving(function ($attendance) {
            if ($attendance->check_in && $attendance->check_out) {
                $attendance->work_hours = $attendance->calculateWorkHours();
            }
        });
    }

    /**
     * Scope for filtering by date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * [تعديل] Scope for filtering by employee.
     */
    public function scopeForEmployee($query, $employeeId)
    {
        return $query->where('employee_id', $employeeId);
    }

    /**
     * Scope for filtering by status.
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Get formatted work hours (e.g., "8:30").
     */
    public function getFormattedWorkHoursAttribute(): ?string
    {
        if (!$this->work_hours) {
            return null;
        }

        $hours = floor($this->work_hours / 60);
        $minutes = $this->work_hours % 60;

        return sprintf('%d:%02d', $hours, $minutes);
    }
}
