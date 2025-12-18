<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'avatar',
        'role_id',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
    ];

    /**
     * Get the role that the user belongs to.
     */
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Get all permissions for the user through their role.
     */
    public function permissions()
    {
        return $this->role->permissions();
    }

    /**
     * Check if user has a specific permission.
     */
    public function hasPermission($permissionName)
    {
        return $this->role->permissions()->where('name', $permissionName)->exists();
    }

    /**
     * Check if user has any of the given permissions.
     */
    public function hasAnyPermission($permissions)
    {
        return $this->role->permissions()->whereIn('name', $permissions)->exists();
    }

    /**
     * Check if user has all of the given permissions.
     */
    public function hasAllPermissions($permissions)
    {
        $count = $this->role->permissions()->whereIn('name', $permissions)->count();
        return $count === count($permissions);
    }

    /**
     * Get sales invoices created by this cashier.
     */
    public function salesInvoices()
    {
        return $this->hasMany(SalesInvoice::class, 'cashier_id');
    }

    /**
     * Get expenses created by this user.
     */
    public function expenses()
    {
        return $this->hasMany(Expense::class, 'cashier_id');
    }

    /**
     * Get cashier sessions for this user.
     */
    public function cashierSessions()
    {
        return $this->hasMany(CashierSession::class, 'cashier_id');
    }
}
