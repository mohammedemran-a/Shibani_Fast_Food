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
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'date',
        'check_in',
        'check_out',
        'work_hours',
        'status',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date' => 'date',
        'check_in' => 'datetime:H:i',
        'check_out' => 'datetime:H:i',
        'work_hours' => 'integer',
    ];

    /**
     * Get the user that owns the attendance.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Calculate work hours in minutes.
     */
    public function calculateWorkHours(): ?int
    {
        if (!$this->check_in || !$this->check_out) {
            return null;
        }

        $checkIn = Carbon::parse($this->check_in);
        $checkOut = Carbon::parse($this->check_out);

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
     * Scope for filtering by user.
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
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
