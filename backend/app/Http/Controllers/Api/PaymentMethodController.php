<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Payment Method Controller
 * 
 * يدير عمليات CRUD لطرق الدفع (المحافظ الإلكترونية)
 */
class PaymentMethodController extends Controller
{
    /**
     * عرض جميع طرق الدفع
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        try {
            $paymentMethods = PaymentMethod::orderBy('is_active', 'desc')
                ->orderBy('name')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $paymentMethods
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل في جلب طرق الدفع',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * عرض طريقة دفع محددة
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        try {
            $paymentMethod = PaymentMethod::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $paymentMethod
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'طريقة الدفع غير موجودة'
            ], 404);
        }
    }

    /**
     * إنشاء طريقة دفع جديدة
     * 
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // التحقق من البيانات
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'icon' => 'nullable|string|max:50',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صحيحة',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $paymentMethod = PaymentMethod::create([
                'name' => $request->name,
                'icon' => $request->icon ?? '💳',
                'is_active' => $request->is_active ?? true,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'تم إضافة طريقة الدفع بنجاح',
                'data' => $paymentMethod
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل في إضافة طريقة الدفع',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * تحديث طريقة دفع
     * 
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        // التحقق من البيانات
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'icon' => 'nullable|string|max:50',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات غير صحيحة',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $paymentMethod = PaymentMethod::findOrFail($id);

            $paymentMethod->update($request->only(['name', 'icon', 'is_active']));

            return response()->json([
                'success' => true,
                'message' => 'تم تحديث طريقة الدفع بنجاح',
                'data' => $paymentMethod
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل في تحديث طريقة الدفع',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * حذف طريقة دفع
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try {
            $paymentMethod = PaymentMethod::findOrFail($id);

            // التحقق من عدم وجود فواتير مرتبطة
            if ($paymentMethod->salesInvoices()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'لا يمكن حذف طريقة الدفع لوجود فواتير مرتبطة بها'
                ], 400);
            }

            $paymentMethod->delete();

            return response()->json([
                'success' => true,
                'message' => 'تم حذف طريقة الدفع بنجاح'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل في حذف طريقة الدفع',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * تفعيل/تعطيل طريقة دفع
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function toggleActive($id)
    {
        try {
            $paymentMethod = PaymentMethod::findOrFail($id);
            $paymentMethod->is_active = !$paymentMethod->is_active;
            $paymentMethod->save();

            return response()->json([
                'success' => true,
                'message' => $paymentMethod->is_active ? 'تم تفعيل طريقة الدفع' : 'تم تعطيل طريقة الدفع',
                'data' => $paymentMethod
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل في تغيير حالة طريقة الدفع',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * عرض طرق الدفع المفعلة فقط
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function active()
    {
        try {
            $paymentMethods = PaymentMethod::active()
                ->orderBy('name')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $paymentMethods
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل في جلب طرق الدفع المفعلة',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
