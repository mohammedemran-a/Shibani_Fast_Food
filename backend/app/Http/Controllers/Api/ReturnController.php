<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Return;
use App\Models\ReturnItem;
use App\Models\PurchaseInvoice;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

/**
 * متحكم المرتجعات (Returns Controller)
 * 
 * يدير عمليات المرتجعات للموردين
 */
class ReturnController extends Controller
{
    /**
     * عرض قائمة المرتجعات
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = Return::with(['supplier', 'purchaseInvoice', 'items.product', 'creator']);

        // فلترة حسب الحالة
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // فلترة حسب المورد
        if ($request->has('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        // فلترة حسب التاريخ
        if ($request->has('from_date')) {
            $query->whereDate('return_date', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->whereDate('return_date', '<=', $request->to_date);
        }

        $returns = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json($returns);
    }

    /**
     * عرض تفاصيل مرتجع واحد
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $return = Return::with(['supplier', 'purchaseInvoice', 'items.product', 'creator'])
            ->findOrFail($id);

        return response()->json($return);
    }

    /**
     * جلب المنتجات المتاحة للإرجاع من فاتورة شراء معينة
     * 
     * @param int $invoiceId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAvailableItems($invoiceId)
    {
        $invoice = PurchaseInvoice::with(['items.product'])->findOrFail($invoiceId);

        $availableItems = [];

        foreach ($invoice->items as $item) {
            // حساب الكمية المرتجعة من هذا المنتج
            $returnedQuantity = ReturnItem::whereHas('return', function($query) use ($invoiceId) {
                $query->where('purchase_invoice_id', $invoiceId)
                      ->where('status', '!=', 'rejected');
            })->where('product_id', $item->product_id)->sum('quantity');

            // حساب الكمية المباعة من هذا المنتج بعد الشراء
            $soldQuantity = DB::table('sales_invoice_items')
                ->join('sales_invoices', 'sales_invoice_items.sales_invoice_id', '=', 'sales_invoices.id')
                ->where('sales_invoice_items.product_id', $item->product_id)
                ->where('sales_invoices.invoice_date', '>=', $invoice->invoice_date)
                ->where('sales_invoices.status', 'completed')
                ->sum('sales_invoice_items.quantity');

            // الكمية المتاحة للإرجاع = الأصلية - المرتجعة - المباعة
            $availableQuantity = $item->quantity - $returnedQuantity - $soldQuantity;

            if ($availableQuantity > 0) {
                $availableItems[] = [
                    'product_id' => $item->product_id,
                    'product_name' => $item->product->name,
                    'original_quantity' => $item->quantity,
                    'returned_quantity' => $returnedQuantity,
                    'sold_quantity' => $soldQuantity,
                    'available_quantity' => $availableQuantity,
                    'unit_price' => $item->unit_price,
                ];
            }
        }

        return response()->json([
            'invoice' => $invoice,
            'available_items' => $availableItems,
        ]);
    }

    /**
     * إنشاء مرتجع جديد
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $request->validate([
            'purchase_invoice_id' => 'required|exists:purchase_invoices,id',
            'return_date' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'reason' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // جلب فاتورة الشراء
            $invoice = PurchaseInvoice::findOrFail($request->purchase_invoice_id);

            // حساب المجموع الإجمالي
            $totalAmount = 0;
            foreach ($request->items as $item) {
                $invoiceItem = $invoice->items()->where('product_id', $item['product_id'])->first();
                if (!$invoiceItem) {
                    return response()->json([
                        'message' => 'المنتج غير موجود في الفاتورة'
                    ], 422);
                }

                // التحقق من الكمية المتاحة للإرجاع
                $returnedQuantity = ReturnItem::whereHas('return', function($query) use ($request) {
                    $query->where('purchase_invoice_id', $request->purchase_invoice_id)
                          ->where('status', '!=', 'rejected');
                })->where('product_id', $item['product_id'])->sum('quantity');

                $soldQuantity = DB::table('sales_invoice_items')
                    ->join('sales_invoices', 'sales_invoice_items.sales_invoice_id', '=', 'sales_invoices.id')
                    ->where('sales_invoice_items.product_id', $item['product_id'])
                    ->where('sales_invoices.invoice_date', '>=', $invoice->invoice_date)
                    ->where('sales_invoices.status', 'completed')
                    ->sum('sales_invoice_items.quantity');

                $availableQuantity = $invoiceItem->quantity - $returnedQuantity - $soldQuantity;

                if ($item['quantity'] > $availableQuantity) {
                    return response()->json([
                        'message' => "الكمية المتاحة للإرجاع من المنتج هي {$availableQuantity} فقط"
                    ], 422);
                }

                $totalAmount += $item['quantity'] * $invoiceItem->unit_price;
            }

            // إنشاء المرتجع
            $return = Return::create([
                'purchase_invoice_id' => $request->purchase_invoice_id,
                'supplier_id' => $invoice->supplier_id,
                'return_date' => $request->return_date,
                'total_amount' => $totalAmount,
                'reason' => $request->reason,
                'status' => 'pending',
                'notes' => $request->notes,
                'created_by' => Auth::id(),
            ]);

            // إضافة عناصر المرتجع
            foreach ($request->items as $item) {
                $invoiceItem = $invoice->items()->where('product_id', $item['product_id'])->first();
                
                ReturnItem::create([
                    'return_id' => $return->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $invoiceItem->unit_price,
                    'total_price' => $item['quantity'] * $invoiceItem->unit_price,
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'تم إنشاء المرتجع بنجاح',
                'return' => $return->load(['items.product', 'supplier']),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'فشل إنشاء المرتجع',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * تحديث حالة المرتجع (الموافقة/الرفض)
     * 
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        DB::beginTransaction();
        try {
            $return = Return::with('items')->findOrFail($id);
            $return->status = $request->status;
            $return->save();

            // إذا تمت الموافقة، نقوم بتحديث المخزون
            if ($request->status === 'approved') {
                foreach ($return->items as $item) {
                    $product = Product::find($item->product_id);
                    // خصم الكمية المرتجعة من المخزون
                    $product->quantity -= $item->quantity;
                    $product->save();
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'تم تحديث حالة المرتجع بنجاح',
                'return' => $return,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'فشل تحديث حالة المرتجع',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * حذف مرتجع
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $return = Return::findOrFail($id);

        if ($return->status === 'approved') {
            return response()->json([
                'message' => 'لا يمكن حذف مرتجع تمت الموافقة عليه'
            ], 422);
        }

        $return->delete();

        return response()->json([
            'message' => 'تم حذف المرتجع بنجاح'
        ]);
    }
}
