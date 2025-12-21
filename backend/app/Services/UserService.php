<?php

namespace App\Services;

use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

/**
 * User Service
 * 
 * يدير منطق المستخدمين
 */
class UserService extends BaseService
{
    /**
     * Get all users with filters.
     *
     * @param array $filters
     * @return array
     */
    public function getAll(array $filters = []): array
    {
        try {
            $query = User::with('role');

            // Filter by role
            if (!empty($filters['role_id'])) {
                $query->where('role_id', $filters['role_id']);
            }

            // Filter by active status
            if (isset($filters['is_active'])) {
                $query->where('is_active', $filters['is_active']);
            }

            // Search by name or email
            if (!empty($filters['search'])) {
                $query->where(function ($q) use ($filters) {
                    $q->where('name', 'like', '%' . $filters['search'] . '%')
                      ->orWhere('email', 'like', '%' . $filters['search'] . '%');
                });
            }

            // Order by name
            $query->orderBy('name', 'asc');

            $users = $query->paginate($filters['per_page'] ?? 15);

            return $this->successResponse($users);
        } catch (Exception $e) {
            $this->logError($e, ['filters' => $filters]);
            return $this->errorResponse($this->getArabicErrorMessage($e));
        }
    }

    /**
     * Get user by ID.
     *
     * @param int $id
     * @return array
     */
    public function getById(int $id): array
    {
        try {
            $user = User::with('role')->findOrFail($id);
            return $this->successResponse($user);
        } catch (Exception $e) {
            $this->logError($e, ['id' => $id]);
            return $this->errorResponse('المستخدم غير موجود');
        }
    }

    /**
     * Create new user.
     *
     * @param array $data
     * @return array
     */
    public function create(array $data): array
    {
        try {
            // Validate data
            $validator = Validator::make($data, [
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:6',
                'phone' => 'nullable|string|max:20',
                'role_id' => 'required|exists:roles,id',
                'is_active' => 'boolean',
            ], [
                'name.required' => 'الاسم مطلوب',
                'name.max' => 'الاسم يجب ألا يتجاوز 255 حرف',
                'email.required' => 'البريد الإلكتروني مطلوب',
                'email.email' => 'البريد الإلكتروني غير صالح',
                'email.unique' => 'البريد الإلكتروني مستخدم مسبقاً',
                'password.required' => 'كلمة المرور مطلوبة',
                'password.min' => 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
                'phone.max' => 'رقم الهاتف يجب ألا يتجاوز 20 رقم',
                'role_id.required' => 'الدور الوظيفي مطلوب',
                'role_id.exists' => 'الدور الوظيفي غير موجود',
            ]);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            $user = $this->executeInTransaction(function () use ($data) {
                return User::create([
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'password' => Hash::make($data['password']),
                    'phone' => $data['phone'] ?? null,
                    'role_id' => $data['role_id'],
                    'is_active' => $data['is_active'] ?? true,
                ]);
            });

            return $this->successResponse($user, 'تم إضافة المستخدم بنجاح');
        } catch (ValidationException $e) {
            return $this->errorResponse('بيانات غير صالحة', $e->errors());
        } catch (Exception $e) {
            $this->logError($e, ['data' => $data]);
            return $this->errorResponse($this->getArabicErrorMessage($e));
        }
    }

    /**
     * Update user.
     *
     * @param int $id
     * @param array $data
     * @return array
     */
    public function update(int $id, array $data): array
    {
        try {
            $user = User::findOrFail($id);

            // Validate data
            $validator = Validator::make($data, [
                'name' => 'sometimes|required|string|max:255',
                'email' => 'sometimes|required|email|unique:users,email,' . $id,
                'password' => 'nullable|string|min:6',
                'phone' => 'nullable|string|max:20',
                'role_id' => 'sometimes|required|exists:roles,id',
                'is_active' => 'boolean',
            ], [
                'name.required' => 'الاسم مطلوب',
                'name.max' => 'الاسم يجب ألا يتجاوز 255 حرف',
                'email.required' => 'البريد الإلكتروني مطلوب',
                'email.email' => 'البريد الإلكتروني غير صالح',
                'email.unique' => 'البريد الإلكتروني مستخدم مسبقاً',
                'password.min' => 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
                'phone.max' => 'رقم الهاتف يجب ألا يتجاوز 20 رقم',
                'role_id.required' => 'الدور الوظيفي مطلوب',
                'role_id.exists' => 'الدور الوظيفي غير موجود',
            ]);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            $user = $this->executeInTransaction(function () use ($user, $data) {
                $updateData = [
                    'name' => $data['name'] ?? $user->name,
                    'email' => $data['email'] ?? $user->email,
                    'phone' => $data['phone'] ?? $user->phone,
                    'role_id' => $data['role_id'] ?? $user->role_id,
                    'is_active' => $data['is_active'] ?? $user->is_active,
                ];

                // Update password only if provided
                if (!empty($data['password'])) {
                    $updateData['password'] = Hash::make($data['password']);
                }

                $user->update($updateData);
                return $user->fresh();
            });

            return $this->successResponse($user, 'تم تحديث المستخدم بنجاح');
        } catch (ValidationException $e) {
            return $this->errorResponse('بيانات غير صالحة', $e->errors());
        } catch (Exception $e) {
            $this->logError($e, ['id' => $id, 'data' => $data]);
            return $this->errorResponse($this->getArabicErrorMessage($e));
        }
    }

    /**
     * Delete user.
     *
     * @param int $id
     * @return array
     */
    public function delete(int $id): array
    {
        try {
            $user = User::findOrFail($id);

            // Prevent deleting yourself
            if ($user->id === auth()->id()) {
                return $this->errorResponse('لا يمكنك حذف حسابك الخاص');
            }

            $this->executeInTransaction(function () use ($user) {
                $user->delete();
            });

            return $this->successResponse(null, 'تم حذف المستخدم بنجاح');
        } catch (Exception $e) {
            $this->logError($e, ['id' => $id]);
            return $this->errorResponse('فشل حذف المستخدم');
        }
    }

    /**
     * Toggle user active status.
     *
     * @param int $id
     * @return array
     */
    public function toggleActive(int $id): array
    {
        try {
            $user = User::findOrFail($id);

            // Prevent deactivating yourself
            if ($user->id === auth()->id()) {
                return $this->errorResponse('لا يمكنك تعطيل حسابك الخاص');
            }

            $user = $this->executeInTransaction(function () use ($user) {
                $user->update(['is_active' => !$user->is_active]);
                return $user->fresh();
            });

            $message = $user->is_active ? 'تم تفعيل المستخدم بنجاح' : 'تم تعطيل المستخدم بنجاح';

            return $this->successResponse($user, $message);
        } catch (Exception $e) {
            $this->logError($e, ['id' => $id]);
            return $this->errorResponse('فشل تغيير حالة المستخدم');
        }
    }
}
