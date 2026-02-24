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
     * عرض قائمة العملاء مع إمكانية البحث والفلترة والفرز المحسّن
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // استعلام أساسي مع تحميل العلاقات والإحصائيات بكفاءة
        $query = Customer::query()
            ->withCount('salesInvoices')
            ->withSum('salesInvoices', 'total_amount')
            ->addSelect([
                'debts_remaining' => DB::table('debts')
                    ->selectRaw('COALESCE(SUM(amount - paid_amount), 0)')
                    ->whereColumn('customer_id', 'customers.id')
            ]);

        // =================================================================
        // **تحسين 1: إضافة حقل افتراضي لآخر تاريخ شراء لتحسين أداء الفرز**
        // =================================================================
        // هذا يضيف حقل 'sales_invoices_max_invoice_date' لكل عميل
        $query->withMax('salesInvoices as last_purchase_date', 'invoice_date');

        // البحث
        $query->when($request->filled('search'), function ($q) use ($request) {
            $search = $request->search;
            $q->where(function($subQ) use ($search) {
                $subQ->where('name', 'like', "%$search%")
                     ->orWhere('phone', 'like', "%$search%")
                     ->orWhere('email', 'like', "%$search%");
            });
        });

        // فلترة حسب الحالة
        $query->when($request->filled('is_active'), function ($q) use ($request) {
            $q->where('is_active', $request->is_active);
        });

        // الترتيب
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        // =================================================================
        // **تحسين 2: تفعيل الفرز حسب آخر عملية شراء**
        // =================================================================
        if ($sortBy === 'last_purchase') {
            // الفرز حسب الحقل الافتراضي الذي أنشأناه
            $query->orderBy('last_purchase_date', $sortOrder);
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }

        $customers = $query->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $customers,
        ]);
    }

    /**
     * إنشاء عميل جديد
     * (بدون تغيير)
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
            'email.unique' => 'البريد الإلكتروني مستخدم من قبل',
            'phone.required' => 'رقم الهاتف مطلوب',
        ]);

        try {
            $customer = Customer::create($validated);
            return response()->json(['success' => true, 'message_key' => 'customers.created_success', 'data' => $customer], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'فشل إضافة العميل', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * عرض تفاصيل عميل محدد
     * (بدون تغيير)
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
        ->addSelect(['debts_remaining' => DB::table('debts')->selectRaw('COALESCE(SUM(amount - paid_amount), 0)')->whereColumn('customer_id', 'customers.id')])
        ->find($id);

        if (!$customer) {
            return response()->json(['success' => false, 'message_key' => 'customers.not_found'], 404);
        }

        return response()->json(['success' => true, 'data' => $customer]);
    }

    /**
     * تحديث بيانات عميل
     * (بدون تغيير)
     */
    public function update(Request $request, string $id)
    {
        $customer = Customer::find($id);
        if (!$customer) { return response()->json(['success' => false, 'message_key' => 'customers.not_found'], 404); }

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
        ]);

        try {
            $customer->update($validated);
            return response()->json(['success' => true, 'message_key' => 'customers.updated_success', 'data' => $customer->fresh()]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'فشل تحديث بيانات العميل', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * حذف عميل
     * (بدون تغيير)
     */
    public function destroy(string $id)
    {
        $customer = Customer::find($id);
        if (!$customer) { return response()->json(['success' => false, 'message_key' => 'customers.not_found'], 404); }
        if ($customer->debts()->where('status', '!=', 'paid')->exists()) { return response()->json(['success' => false, 'message_key' => 'customers.delete_has_debt'], 422); }

        try {
            $customer->delete();
            return response()->json(['success' => true, 'message_key' => 'customers.deleted_success']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'فشل حذف العميل', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * الحصول على إحصائيات العملاء
     * (بدون تغيير)
     */
    public function statistics()
    {
        $stats = [
            'total_customers' => Customer::count(),
            'active_customers' => Customer::where('is_active', true)->count(),
            'total_debts' => DB::table('debts')->sum(DB::raw('amount - paid_amount')),
            'top_customers' => Customer::withSum('salesInvoices', 'total_amount')->orderByDesc('sales_invoices_sum_total_amount')->take(5)->get(['id', 'name', 'phone']),
        ];
        return response()->json(['success' => true, 'data' => $stats]);
    }

    /**
     * جلب التفاصيل الكاملة لديون عميل محدد
     * (بدون تغيير)
     */
    public function getDebtDetails(Customer $customer)
    {
        $invoices = $customer->debts()->where('status', '!=', 'paid')->with('salesInvoice')->get()->map(fn ($debt) => [
            'id' => $debt->sales_invoice_id,
            'debt_id' => $debt->id,
            'invoice_number' => $debt->salesInvoice->invoice_number,
            'sale_date' => $debt->salesInvoice->invoice_date->format('Y-m-d'),
            'total_amount' => (float) $debt->amount,
            'paid_amount' => (float) $debt->paid_amount,
            'remaining_amount' => (float) ($debt->amount - $debt->paid_amount),
        ]);

        $payments = \App\Models\DebtPayment::whereIn('debt_id', $customer->debts()->pluck('id'))->latest()->with('debt.salesInvoice:id,invoice_number')->get()->map(fn ($payment) => [
            'id' => $payment->id,
            'payment_date' => $payment->payment_date->format('Y-m-d'),
            'amount' => (float) $payment->amount,
            'invoice_number' => $payment->debt->salesInvoice->invoice_number ?? null,
        ]);

        $data = [
            'customer' => $customer->only(['id', 'name', 'phone', 'email', 'address']),
            'invoices' => $invoices,
            'payments' => $payments,
            'summary' => [
                'total_debt' => (float) $customer->debts()->sum(DB::raw('amount - paid_amount')),
                'total_paid' => (float) $customer->debts()->sum('paid_amount'),
            ]
        ];

        return response()->json($data);
    }
}
