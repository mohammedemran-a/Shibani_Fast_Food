<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CustomerController extends Controller
{
    /**
     * عرض قائمة العملاء مع إمكانية البحث والفلترة
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = Customer::query();

        // البحث
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('phone', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%")
                  ->orWhere('city', 'like', "%$search%");
            });
        }

        // فلترة حسب الحالة
        if ($request->has('is_active') && $request->is_active !== '') {
            $query->where('is_active', $request->is_active);
        }

        // فلترة حسب المدينة
        if ($request->has('city') && !empty($request->city)) {
            $query->where('city', $request->city);
        }

        // الترتيب
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // إضافة إحصائيات لكل عميل
        $query->withCount('salesInvoices')
              ->withSum('salesInvoices', 'total_amount')
              ->withSum('debts', 'remaining_amount');

        $customers = $query->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $customers,
        ]);
    }

    /**
     * إنشاء عميل جديد
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:customers,email',
            'phone' => 'required|string|max:20',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:1000',
        ], [
            'name.required' => 'اسم العميل مطلوب',
            'name.max' => 'اسم العميل يجب أن لا يتجاوز 255 حرف',
            'email.email' => 'البريد الإلكتروني غير صحيح',
            'email.unique' => 'البريد الإلكتروني مستخدم من قبل',
            'phone.required' => 'رقم الهاتف مطلوب',
            'phone.max' => 'رقم الهاتف يجب أن لا يتجاوز 20 رقم',
        ]);

        try {
            $customer = Customer::create([
                'name' => $validated['name'],
                'email' => $validated['email'] ?? null,
                'phone' => $validated['phone'],
                'address' => $validated['address'] ?? null,
                'city' => $validated['city'] ?? null,
                'country' => $validated['country'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'loyalty_points' => 0,
                'is_active' => true,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'تم إضافة العميل بنجاح',
                'data' => $customer,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل إضافة العميل',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * عرض تفاصيل عميل محدد
     * 
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(string $id)
    {
        $customer = Customer::with(['salesInvoices' => function($query) {
            $query->latest()->take(10);
        }, 'debts' => function($query) {
            $query->where('remaining_amount', '>', 0);
        }])
        ->withCount('salesInvoices')
        ->withSum('salesInvoices', 'total_amount')
        ->withSum('debts', 'remaining_amount')
        ->find($id);

        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'العميل غير موجود',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $customer,
        ]);
    }

    /**
     * تحديث بيانات عميل
     * 
     * @param Request $request
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, string $id)
    {
        $customer = Customer::find($id);

        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'العميل غير موجود',
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'nullable|email|unique:customers,email,' . $id,
            'phone' => 'sometimes|required|string|max:20',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:1000',
            'is_active' => 'sometimes|boolean',
            'loyalty_points' => 'sometimes|numeric|min:0',
        ], [
            'name.required' => 'اسم العميل مطلوب',
            'name.max' => 'اسم العميل يجب أن لا يتجاوز 255 حرف',
            'email.email' => 'البريد الإلكتروني غير صحيح',
            'email.unique' => 'البريد الإلكتروني مستخدم من قبل',
            'phone.required' => 'رقم الهاتف مطلوب',
        ]);

        try {
            $customer->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'تم تحديث بيانات العميل بنجاح',
                'data' => $customer->fresh(),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل تحديث بيانات العميل',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * حذف عميل
     * 
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(string $id)
    {
        $customer = Customer::find($id);

        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'العميل غير موجود',
            ], 404);
        }

        // التحقق من وجود فواتير مرتبطة
        if ($customer->salesInvoices()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن حذف العميل لوجود فواتير مرتبطة به',
            ], 422);
        }

        // التحقق من وجود ديون مرتبطة
        if ($customer->debts()->where('remaining_amount', '>', 0)->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن حذف العميل لوجود ديون غير مسددة',
            ], 422);
        }

        try {
            $customer->delete();

            return response()->json([
                'success' => true,
                'message' => 'تم حذف العميل بنجاح',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل حذف العميل',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * الحصول على إحصائيات العملاء
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function statistics()
    {
        $stats = [
            'total_customers' => Customer::count(),
            'active_customers' => Customer::where('is_active', true)->count(),
            'inactive_customers' => Customer::where('is_active', false)->count(),
            'total_sales' => DB::table('sales_invoices')
                ->whereNotNull('customer_id')
                ->sum('total_amount'),
            'total_debts' => DB::table('debts')
                ->whereNotNull('customer_id')
                ->sum('remaining_amount'),
            'top_customers' => Customer::withSum('salesInvoices', 'total_amount')
                ->orderByDesc('sales_invoices_sum_total_amount')
                ->take(5)
                ->get(['id', 'name', 'phone']),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
