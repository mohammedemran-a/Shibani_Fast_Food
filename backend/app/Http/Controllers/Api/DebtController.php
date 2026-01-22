<?php

// backend/app/Http/Controllers/Api/DebtController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Debt;
use App\Models\DebtPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class DebtController extends Controller
{
    /**
     * // جلب ملخص ديون جميع العملاء
     * // هذا الـ Endpoint يجمع البيانات لعرضها في القائمة الرئيسية للديون
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getDebtsSummary(Request $request)
    {
        // الاستعلام الأساسي للعملاء الذين لديهم ديون غير مسددة
        $query = Customer::query()
            ->whereHas('debts', function ($q) {
                $q->where('status', '!=', 'paid');
            })
            ->select('id as customer_id', 'name as customer_name', 'phone as customer_phone')
            ->withCount(['debts as unpaid_invoices_count' => function ($q) {
                $q->where('status', '!=', 'paid');
            }])
            ->withSum(['debts as total_debt' => function ($q) {
                $q->where('status', '!=', 'paid');
            }], DB::raw('amount - paid_amount'))
            ->withMax('salesInvoices as last_purchase_date', 'invoice_date');

        // البحث باسم العميل أو رقم الهاتف
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $debtsSummary = $query->orderByDesc('total_debt')->paginate($request->per_page ?? 15);

        return response()->json($debtsSummary);
    }

    /**
     * // تسجيل دفعة جديدة لدين
     * // هذا الـ Endpoint يعالج عملية الدفع سواء لدين فاتورة محددة أو كدفعة عامة
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function storePayment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'debt_id' => 'nullable|exists:debts,id', // أصبح debt_id بدلاً من invoice_id
            'customer_id' => 'required|exists:customers,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'payment_method' => 'required|string|in:cash,wallet,check',
        ]);

        if ($validator->fails()) {
            return response()->json(['message_key' => 'common.validation_error', 'errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $paymentAmount = (float) $data['amount'];

        DB::beginTransaction();
        try {
            if (isset($data['debt_id'])) {
                // دفعة لدين محدد
                $debt = Debt::findOrFail($data['debt_id']);
                
                // التحقق من أن مبلغ الدفعة لا يتجاوز المبلغ المتبقي
                $remaining = $debt->amount - $debt->paid_amount;
                if ($paymentAmount > ($remaining + 0.001)) { // السماح بهامش خطأ صغير
                    DB::rollBack();
                    return response()->json(['message_key' => 'debts.amount_exceeds_debt'], 422);
                }
                
                // تسجيل الدفعة
                $debt->payments()->create([
                    'amount' => $paymentAmount,
                    'payment_date' => $data['payment_date'],
                    'payment_method' => $data['payment_method'],
                    'created_by' => Auth::id(),
                ]);

                // تحديث الدين
                $debt->paid_amount += $paymentAmount;
                $debt->status = (($debt->amount - $debt->paid_amount) < 0.01) ? 'paid' : 'partial';
                $debt->save();

            } else {
                // دفعة عامة، يتم توزيعها على أقدم الديون غير المسددة للعميل
                $unpaidDebts = Debt::where('customer_id', $data['customer_id'])
                    ->where('status', '!=', 'paid')
                    ->orderBy('created_at', 'asc')
                    ->get();
                
                foreach ($unpaidDebts as $debt) {
                    if ($paymentAmount <= 0) break;

                    $remainingOnDebt = $debt->amount - $debt->paid_amount;
                    $amountToPay = min($paymentAmount, $remainingOnDebt);
                    
                    // تسجيل دفعة جزئية لهذا الدين
                    $debt->payments()->create([
                        'amount' => $amountToPay,
                        'payment_date' => $data['payment_date'],
                        'payment_method' => $data['payment_method'],
                        'created_by' => Auth::id(),
                    ]);

                    // تحديث الدين
                    $debt->paid_amount += $amountToPay;
                    $debt->status = (($debt->amount - $debt->paid_amount) < 0.01) ? 'paid' : 'partial';
                    $debt->save();

                    $paymentAmount -= $amountToPay;
                }
            }

            DB::commit();
            return response()->json(['message_key' => 'debts.payment_added_success'], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message_key' => 'common.error_occurred', 'error' => $e->getMessage()], 500);
        }
    }
}
