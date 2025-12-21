<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingsController extends Controller
{
    /**
     * الحصول على جميع الإعدادات
     */
    public function index()
    {
        $settings = SystemSetting::getAll();
        
        // تحويل مسار الشعار إلى URL كامل
        if (isset($settings['company_logo']) && $settings['company_logo']) {
            $settings['company_logo'] = Storage::url($settings['company_logo']);
        }
        
        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    /**
     * تحديث الإعدادات
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'nullable|string|max:255',
            'company_email' => 'nullable|email|max:255',
            'company_phone' => 'nullable|string|max:20',
            'company_address' => 'nullable|string',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'default_discount' => 'nullable|numeric|min:0|max:100',
            'default_currency_id' => 'nullable|exists:currencies,id',
            'enable_loyalty' => 'nullable|boolean',
            'loyalty_points_ratio' => 'nullable|numeric|min:0',
            'enable_wallet' => 'nullable|boolean',
        ], [
            'company_name.string' => 'اسم الشركة يجب أن يكون نصاً',
            'company_email.email' => 'البريد الإلكتروني غير صحيح',
            'tax_rate.numeric' => 'نسبة الضريبة يجب أن تكون رقماً',
            'tax_rate.min' => 'نسبة الضريبة يجب أن تكون 0 على الأقل',
            'tax_rate.max' => 'نسبة الضريبة يجب ألا تتجاوز 100',
            'default_discount.numeric' => 'الخصم الافتراضي يجب أن يكون رقماً',
            'default_currency_id.exists' => 'العملة المحددة غير موجودة',
        ]);

        try {
            foreach ($validated as $key => $value) {
                SystemSetting::set($key, $value);
            }

            $settings = SystemSetting::getAll();
            
            // تحويل مسار الشعار إلى URL كامل
            if (isset($settings['company_logo']) && $settings['company_logo']) {
                $settings['company_logo'] = Storage::url($settings['company_logo']);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'تم تحديث الإعدادات بنجاح',
                'data' => $settings,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل تحديث الإعدادات',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * رفع شعار الشركة
     */
    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,svg,webp,gif|max:10240',
        ], [
            'logo.required' => 'يرجى اختيار صورة الشعار',
            'logo.image' => 'الملف يجب أن يكون صورة',
            'logo.mimes' => 'الصورة يجب أن تكون بصيغة jpeg, png, jpg, svg, webp, أو gif',
            'logo.max' => 'حجم الصورة يجب ألا يتجاوز 10MB',
        ]);

        try {
            // حذف الشعار القديم إذا كان موجوداً
            $oldLogo = SystemSetting::get('company_logo');
            if ($oldLogo && Storage::disk('public')->exists($oldLogo)) {
                Storage::disk('public')->delete($oldLogo);
            }

            // رفع الشعار الجديد
            $path = $request->file('logo')->store('logos', 'public');
            SystemSetting::set('company_logo', $path);

            return response()->json([
                'success' => true,
                'message' => 'تم رفع الشعار بنجاح',
                'data' => [
                    'logo_url' => Storage::url($path),
                    'logo_path' => $path,
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل رفع الشعار',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * الحصول على إعداد محدد
     */
    public function getSetting(string $key)
    {
        $value = SystemSetting::get($key);

        if ($value === null) {
            return response()->json([
                'success' => false,
                'message' => 'الإعداد غير موجود',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'key' => $key,
                'value' => $value,
            ],
        ]);
    }
}
