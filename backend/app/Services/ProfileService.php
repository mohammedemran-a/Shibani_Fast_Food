<?php

namespace App\Services;

use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

/**
 * Profile Service
 * 
 * يدير منطق الملف الشخصي للمستخدم
 */
class ProfileService extends BaseService
{
    /**
     * Get user profile.
     *
     * @param int $userId
     * @return array
     */
    public function getProfile(int $userId): array
    {
        try {
            $user = User::with('role')->findOrFail($userId);
            return $this->successResponse($user);
        } catch (Exception $e) {
            $this->logError($e, ['user_id' => $userId]);
            return $this->errorResponse('فشل جلب بيانات الملف الشخصي');
        }
    }

    /**
     * Update user profile.
     *
     * @param int $userId
     * @param array $data
     * @return array
     */
    public function updateProfile(int $userId, array $data): array
    {
        try {
            $user = User::findOrFail($userId);

            // Validate data
            $validator = Validator::make($data, [
                'name' => 'sometimes|required|string|max:255',
                'email' => 'sometimes|required|email|unique:users,email,' . $userId,
                'phone' => 'nullable|string|max:20',
            ], [
                'name.required' => 'الاسم مطلوب',
                'name.max' => 'الاسم يجب ألا يتجاوز 255 حرف',
                'email.required' => 'البريد الإلكتروني مطلوب',
                'email.email' => 'البريد الإلكتروني غير صالح',
                'email.unique' => 'البريد الإلكتروني مستخدم مسبقاً',
                'phone.max' => 'رقم الهاتف يجب ألا يتجاوز 20 رقم',
            ]);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            $user = $this->executeInTransaction(function () use ($user, $data) {
                $updateData = [];

                if (isset($data['name'])) {
                    $updateData['name'] = $data['name'];
                }

                if (isset($data['email'])) {
                    $updateData['email'] = $data['email'];
                }

                if (isset($data['phone'])) {
                    $updateData['phone'] = $data['phone'];
                }

                $user->update($updateData);
                return $user->fresh();
            });

            return $this->successResponse($user, 'تم تحديث الملف الشخصي بنجاح');
        } catch (ValidationException $e) {
            return $this->errorResponse('بيانات غير صالحة', $e->errors());
        } catch (Exception $e) {
            $this->logError($e, ['user_id' => $userId, 'data' => $data]);
            return $this->errorResponse($this->getArabicErrorMessage($e));
        }
    }

    /**
     * Update user avatar.
     *
     * @param int $userId
     * @param mixed $avatar
     * @return array
     */
    public function updateAvatar(int $userId, $avatar): array
    {
        try {
            $user = User::findOrFail($userId);

            // Validate avatar
            $validator = Validator::make(['avatar' => $avatar], [
                'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            ], [
                'avatar.required' => 'الصورة مطلوبة',
                'avatar.image' => 'يجب أن يكون الملف صورة',
                'avatar.mimes' => 'يجب أن تكون الصورة من نوع: jpeg, png, jpg, gif',
                'avatar.max' => 'حجم الصورة يجب ألا يتجاوز 2 ميجابايت',
            ]);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            $user = $this->executeInTransaction(function () use ($user, $avatar) {
                // Delete old avatar if exists
                if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                    Storage::disk('public')->delete($user->avatar);
                }

                // Store new avatar
                $path = $avatar->store('avatars', 'public');
                $user->update(['avatar' => $path]);

                return $user->fresh();
            });

            return $this->successResponse($user, 'تم تحديث الصورة الشخصية بنجاح');
        } catch (ValidationException $e) {
            return $this->errorResponse('صورة غير صالحة', $e->errors());
        } catch (Exception $e) {
            $this->logError($e, ['user_id' => $userId]);
            return $this->errorResponse('فشل تحديث الصورة الشخصية');
        }
    }

    /**
     * Change user password.
     *
     * @param int $userId
     * @param array $data
     * @return array
     */
    public function changePassword(int $userId, array $data): array
    {
        try {
            $user = User::findOrFail($userId);

            // Validate data
            $validator = Validator::make($data, [
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:6|confirmed',
            ], [
                'current_password.required' => 'كلمة المرور الحالية مطلوبة',
                'new_password.required' => 'كلمة المرور الجديدة مطلوبة',
                'new_password.min' => 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل',
                'new_password.confirmed' => 'كلمة المرور الجديدة غير متطابقة',
            ]);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            // Check current password
            if (!Hash::check($data['current_password'], $user->password)) {
                return $this->errorResponse('كلمة المرور الحالية غير صحيحة');
            }

            // Check if new password is same as current
            if (Hash::check($data['new_password'], $user->password)) {
                return $this->errorResponse('كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية');
            }

            $this->executeInTransaction(function () use ($user, $data) {
                $user->update([
                    'password' => Hash::make($data['new_password']),
                ]);
            });

            return $this->successResponse(null, 'تم تغيير كلمة المرور بنجاح');
        } catch (ValidationException $e) {
            return $this->errorResponse('بيانات غير صالحة', $e->errors());
        } catch (Exception $e) {
            $this->logError($e, ['user_id' => $userId]);
            return $this->errorResponse('فشل تغيير كلمة المرور');
        }
    }

    /**
     * Delete user avatar.
     *
     * @param int $userId
     * @return array
     */
    public function deleteAvatar(int $userId): array
    {
        try {
            $user = User::findOrFail($userId);

            if (!$user->avatar) {
                return $this->errorResponse('لا توجد صورة شخصية لحذفها');
            }

            $this->executeInTransaction(function () use ($user) {
                // Delete avatar file
                if (Storage::disk('public')->exists($user->avatar)) {
                    Storage::disk('public')->delete($user->avatar);
                }

                $user->update(['avatar' => null]);
            });

            return $this->successResponse(null, 'تم حذف الصورة الشخصية بنجاح');
        } catch (Exception $e) {
            $this->logError($e, ['user_id' => $userId]);
            return $this->errorResponse('فشل حذف الصورة الشخصية');
        }
    }
}
