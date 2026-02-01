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
        
        if (isset($settings['company_logo']) && $settings['company_logo']) {
            $settings['company_logo'] = url(Storage::url($settings['company_logo']));
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
        // =================================================================
        // **التعديل الرئيسي هنا: إضافة قواعد التحقق لإعدادات الولاء**
        // =================================================================
        /**
         * قمنا بتوسيع قواعد التحقق لتشمل جميع مفاتيح إعدادات الولاء.
         * هذا يجعل المتحكم مرنًا وقادرًا على حفظ أي مجموعة من الإعدادات
         * يتم إرسالها من الواجهة الأمامية في طلب واحد.
         * استخدمنا 'nullable' للسماح بتحديث إعداد واحد دون الحاجة لإرسال جميع الإعدادات الأخرى.
         */
        $validated = $request->validate([
            // الإعدادات العامة (موجودة سابقًا)
            'company_name' => 'nullable|string|max:255',
            'company_email' => 'nullable|email|max:255',
            'company_phone' => 'nullable|string|max:20',
            'company_address' => 'nullable|string',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'default_discount' => 'nullable|numeric|min:0|max:100',
            'default_currency_id' => 'nullable|exists:currencies,id',
            
            // إعدادات الولاء الجديدة
            'loyalty_enabled' => 'nullable|boolean',
            'loyalty_points_per_currency' => 'nullable|numeric|min:0',
            'loyalty_currency_per_point' => 'nullable|numeric|min:0',
            'loyalty_minimum_redemption' => 'nullable|integer|min:0',
            'loyalty_welcome_bonus' => 'nullable|integer|min:0',
            'loyalty_birthday_bonus' => 'nullable|integer|min:0',
            'loyalty_expiry_days' => 'nullable|integer|min:0',

            // إعدادات أخرى (مثال)
            'enable_wallet' => 'nullable|boolean',
        ], [
            // رسائل الخطأ (يمكن إضافة المزيد لإعدادات الولاء إذا لزم الأمر)
            'company_name.string' => 'اسم الشركة يجب أن يكون نصاً',
            'company_email.email' => 'البريد الإلكتروني غير صحيح',
            'tax_rate.numeric' => 'نسبة الضريبة يجب أن تكون رقماً',
            'default_currency_id.exists' => 'العملة المحددة غير موجودة',
        ]);

        try {
            // لا حاجة لتغيير هذا الجزء، فهو مرن بما يكفي
            // سيقوم بالمرور على جميع البيانات التي تم التحقق منها وحفظها
            foreach ($validated as $key => $value) {
                // التأكد من عدم حفظ القيم الفارغة التي لم يتم إرسالها
                if ($request->has($key)) {
                    SystemSetting::set($key, $value);
                }
            }

            $settings = SystemSetting::getAll();
            
            if (isset($settings['company_logo']) && $settings['company_logo']) {
                $settings['company_logo'] = url(Storage::url($settings['company_logo']));
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
            $oldLogo = SystemSetting::get('company_logo');
            if ($oldLogo && Storage::disk('public')->exists($oldLogo)) {
                Storage::disk('public')->delete($oldLogo);
            }

            $path = $request->file('logo')->store('logos', 'public');
            SystemSetting::set('company_logo', $path);

            $logoUrl = url(Storage::url($path));
            
            return response()->json([
                'success' => true,
                'message' => 'تم رفع الشعار بنجاح',
                'data' => [
                    'logo_url' => $logoUrl,
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
