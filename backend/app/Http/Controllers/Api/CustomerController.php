<?php

// backend/app/Http/Controllers/Api/CustomerController.php

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
              ->addSelect([
                  'debts_remaining' => DB::table('debts')
                      ->selectRaw('COALESCE(SUM(amount - paid_amount), 0)')
                      ->whereColumn('customer_id', 'customers.id')
              ]);

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
            $customer = Customer::create($validated);

            return response()->json([
                'success' => true,
                'message_key' => 'customers.created_success',
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
            $query->where('status', '!=', 'paid');
        }])
        ->withCount('salesInvoices')
        ->withSum('salesInvoices', 'total_amount')
        ->addSelect([
            'debts_remaining' => DB::table('debts')
                ->selectRaw('COALESCE(SUM(amount - paid_amount), 0)')
                ->whereColumn('customer_id', 'customers.id')
        ])
        ->find($id);

        if (!$customer) {
            return response()->json(['success' => false, 'message_key' => 'customers.not_found'], 404);
        }

        return response()->json(['success' => true, 'data' => $customer]);
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
            return response()->json(['success' => false, 'message_key' => 'customers.not_found'], 404);
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
            'email.email' => 'البريد الإلكتروني غير صحيح',
            'email.unique' => 'البريد الإلكتروني مستخدم من قبل',
            'phone.required' => 'رقم الهاتف مطلوب',
        ]);

        try {
            $customer->update($validated);

            return response()->json([
                'success' => true,
                'message_key' => 'customers.updated_success',
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
            return response()->json(['success' => false, 'message_key' => 'customers.not_found'], 404);
        }

        if ($customer->debts()->where('status', '!=', 'paid')->exists()) {
            return response()->json(['success' => false, 'message_key' => 'customers.delete_has_debt'], 422);
        }

        try {
            $customer->delete();
            return response()->json(['success' => true, 'message_key' => 'customers.deleted_success']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'فشل حذف العميل', 'error' => $e->getMessage()], 500);
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
            'total_debts' => DB::table('debts')->sum(DB::raw('amount - paid_amount')),
            'top_customers' => Customer::withSum('salesInvoices', 'total_amount')
                ->orderByDesc('sales_invoices_sum_total_amount')
                ->take(5)
                ->get(['id', 'name', 'phone']),
        ];

        return response()->json(['success' => true, 'data' => $stats]);
    }

    /**
     * // ** إضافة: جلب التفاصيل الكاملة لديون عميل محدد **
     * // هذا الـ Endpoint يخدم صفحة تفاصيل ديون العميل
     *
     * @param Customer $customer
     * @return \Illuminate\Http\JsonResponse
     */
    public function getDebtDetails(Customer $customer)
    {
        // جلب الفواتير المرتبطة بالديون غير المسددة بالكامل
        $invoices = $customer->debts()
            ->where('status', '!=', 'paid')
            ->with('salesInvoice') // تحميل علاقة الفاتورة
            ->get()
            ->map(function ($debt) {
                return [
                    'id' => $debt->sales_invoice_id, // استخدام معرف الفاتورة
                    'debt_id' => $debt->id, // إضافة معرف الدين
                    'invoice_number' => $debt->salesInvoice->invoice_number,
                    'sale_date' => $debt->salesInvoice->invoice_date->format('Y-m-d'),
                    'total_amount' => (float) $debt->amount,
                    'paid_amount' => (float) $debt->paid_amount,
                    'remaining_amount' => (float) ($debt->amount - $debt->paid_amount),
                ];
            });

        // جلب سجل الدفعات المرتبطة بديون هذا العميل
        $payments = \App\Models\DebtPayment::whereIn('debt_id', $customer->debts()->pluck('id'))
            ->latest()
            ->with('debt.salesInvoice:id,invoice_number') // جلب رقم الفاتورة من خلال الدين
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'payment_date' => $payment->payment_date->format('Y-m-d'),
                    'amount' => (float) $payment->amount,
                    'invoice_number' => $payment->debt->salesInvoice->invoice_number ?? null,
                ];
            });

        // حساب ملخص الديون
        $total_debt = $customer->debts()->sum(DB::raw('amount - paid_amount'));
        $total_paid = $customer->debts()->sum('paid_amount');

        // تجميع البيانات النهائية
        $data = [
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'phone' => $customer->phone,
                'email' => $customer->email,
                'address' => $customer->address,
            ],
            'invoices' => $invoices,
            'payments' => $payments,
            'summary' => [
                'total_debt' => (float) $total_debt,
                'total_paid' => (float) $total_paid,
            ]
        ];

        return response()->json($data);
    }
}
