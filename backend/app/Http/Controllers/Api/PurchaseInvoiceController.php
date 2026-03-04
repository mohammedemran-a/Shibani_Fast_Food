<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PurchaseInvoice;
use App\Models\PurchaseInvoiceItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class PurchaseInvoiceController extends Controller
{
    public function index(Request $request)
    {
        $query = PurchaseInvoice::with(['supplier', 'items.product', 'creator']);

        if ($request->has('from_date') && $request->from_date) {
            $query->whereDate('invoice_date', '>=', $request->from_date);
        }
        
        if ($request->has('to_date') && $request->to_date) {
            $query->whereDate('invoice_date', '<=', $request->to_date);
        }

        if ($request->has('search') && $request->search) {
            $query->where('invoice_number', 'like', '%' . $request->search . '%');
        }

        if ($request->has('supplier_id') && $request->supplier_id) {
            $query->where('supplier_id', $request->supplier_id);
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $invoices = $query->orderBy('invoice_date', 'desc')
                          ->paginate($request->get('per_page', 50));

        return response()->json([
            'success' => true,
            'data' => $invoices,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'invoice_date' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.product_id' => [
                'required',
                Rule::exists('products', 'id')->where('type', 'RawMaterial')
            ],
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.expiry_date' => 'nullable|date',
        ]);

        try {
            $invoice = DB::transaction(function () use ($validated, $request) {
                $invoice = PurchaseInvoice::create([
                    'supplier_id' => $validated['supplier_id'],
                    'invoice_date' => $validated['invoice_date'],
                    'invoice_number' => 'PUR-' . date('Ymd') . '-' . str_pad(PurchaseInvoice::count() + 1, 4, '0', STR_PAD_LEFT),
                    'created_by' => $request->user()->id,
                    'total_amount' => 0,
                ]);

                $totalInvoiceAmount = 0;

                foreach ($validated['items'] as $itemData) {
                    $totalItemPrice = $itemData['quantity'] * $itemData['unit_price'];

                    PurchaseInvoiceItem::create([
                        'purchase_invoice_id' => $invoice->id,
                        'product_id' => $itemData['product_id'],
                        'quantity' => $itemData['quantity'],
                        'unit_price' => $itemData['unit_price'],
                        'total_price' => $totalItemPrice,
                        'expiry_date' => $itemData['expiry_date'] ?? null,
                    ]);

                    $product = Product::find($itemData['product_id']);
                    if ($product) {
                        $product->increment('stock', $itemData['quantity']);
                    }

                    $totalInvoiceAmount += $totalItemPrice;
                }

                $invoice->total_amount = $totalInvoiceAmount;
                $invoice->save();

                return $invoice;
            });

            return response()->json(['success' => true, 'message' => 'تم إنشاء الفاتورة وتحديث المخزون بنجاح.'], 201);

        } catch (\Exception $e) {
            Log::error("خطأ في إنشاء فاتورة الشراء: " . $e->getMessage() . " في الملف: " . $e->getFile() . " على السطر: " . $e->getLine());
            return response()->json(['success' => false, 'message' => 'حدث خطأ غير متوقع أثناء إنشاء الفاتورة.'], 500);
        }
    }

    public function show(string $id)
    {
        $invoice = PurchaseInvoice::with(['supplier', 'items.product', 'creator'])->find($id);

        if (!$invoice) {
            return response()->json(['success' => false, 'message' => 'الفاتورة غير موجودة'], 404);
        }

        return response()->json(['success' => true, 'data' => $invoice]);
    }

    /**
     * ✅✅✅ هذا هو التعديل النهائي لدالة الحذف (بدون مراقب) ✅✅✅
     *
     * @param  \App\Models\PurchaseInvoice  $purchaseInvoice
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(PurchaseInvoice $purchaseInvoice)
    {
        try {
            // استخدام transaction لضمان تنفيذ العمليات معًا أو عدم تنفيذ أي منها
            DB::transaction(function () use ($purchaseInvoice) {
                // الخطوة 1: المرور على كل بند في الفاتورة قبل حذفها
                // يجب تحميل علاقة `items` للتأكد من أنها موجودة
                foreach ($purchaseInvoice->items as $item) {
                    // ابحث عن المنتج المرتبط
                    $product = Product::find($item->product_id);
                    if ($product) {
                        // قم بطرح الكمية من المخزون
                        $product->decrement('stock', $item->quantity);
                    }
                }

                // الخطوة 2: بعد تحديث المخزون، قم بحذف الفاتورة
                // سيتم حذف البنود تلقائيًا بسبب علاقة onDelete('cascade') في ملف الهجرة
                $purchaseInvoice->delete();
            });

            return response()->json(['success' => true, 'message' => 'تم حذف الفاتورة وتحديث المخزون بنجاح.']);

        } catch (\Exception $e) {
            Log::error("خطأ في حذف فاتورة الشراء: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'حدث خطأ غير متوقع أثناء الحذف.'], 500);
        }
    }
}
