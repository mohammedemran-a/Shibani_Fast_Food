<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Employee extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'job_title',
        'department',
        'salary_type',
        'salary',
        'hourly_rate',
        'hire_date',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'salary' => 'decimal:2',
        'hourly_rate' => 'decimal:2',
        'hire_date' => 'date',
    ];

    /**
     * علاقة الموظف بالمستخدم (كل موظف ينتمي لمستخدم واحد).
     * The user that this employee record belongs to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
