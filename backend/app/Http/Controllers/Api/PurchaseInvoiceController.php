<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\PurchaseInvoice;
use App\Models\PurchaseInvoiceItem;
use App\Models\ProductStockBatch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PurchaseInvoiceController extends Controller
{
    /**
     * عرض قائمة فواتير المشتريات مع الفلترة
     */
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

    /**
     * ✅ ===================================================================
     * ✅ دالة إنشاء فاتورة شراء جديدة (النسخة النهائية والمحدثة)
     * ✅ ===================================================================
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'invoice_date' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.001',
            'items.*.purchase_price_per_unit' => 'required|numeric|min:0',
            'items.*.expiry_date' => 'nullable|date|after_or_equal:today',
        ]);

        try {
            $invoice = DB::transaction(function () use ($validated, $request) {
                // 2. إنشاء فاتورة الشراء الرئيسية مع قيمة أولية للمبلغ الإجمالي
                $invoice = PurchaseInvoice::create([
                    'supplier_id' => $validated['supplier_id'],
                    'invoice_date' => $validated['invoice_date'],
                    'invoice_number' => 'PUR-' . date('Ymd') . '-' . str_pad(PurchaseInvoice::count() + 1, 4, '0', STR_PAD_LEFT),
                    'created_by' => $request->user()->id,
                    'total_amount' => 0, // ✅ الحل: إضافة قيمة أولية هنا
                ]);

                $totalInvoiceAmount = 0;

                // 3. معالجة كل عنصر وإضافة دفعة مخزون جديدة
                foreach ($validated['items'] as $itemData) {
                    ProductStockBatch::create([
                        'product_id' => $itemData['product_id'],
                        'purchase_invoice_id' => $invoice->id,
                        'quantity_received' => $itemData['quantity'],
                        'quantity_remaining' => $itemData['quantity'],
                        'purchase_price_per_unit' => $itemData['purchase_price_per_unit'],
                        'expiry_date' => $itemData['expiry_date'] ?? null,
                    ]);

                    $totalItemPrice = $itemData['quantity'] * $itemData['purchase_price_per_unit'];
                    PurchaseInvoiceItem::create([
                        'purchase_invoice_id' => $invoice->id,
                        'product_id' => $itemData['product_id'],
                        'quantity' => $itemData['quantity'],
                        'unit_price' => $itemData['purchase_price_per_unit'],
                        'total_price' => $totalItemPrice,
                    ]);

                    $totalInvoiceAmount += $totalItemPrice;
                }

                // 6. تحديث المبلغ الإجمالي للفاتورة بالقيمة النهائية
                $invoice->total_amount = $totalInvoiceAmount;
                $invoice->save();

                return $invoice;
            });

            return response()->json(['success' => true, 'message' => 'تم إنشاء فاتورة الشراء وإضافة المخزون بنجاح.', 'data' => $invoice], 201);

        } catch (\Exception $e) {
            Log::error("خطأ في إنشاء فاتورة الشراء: " . $e->getMessage() . " في الملف: " . $e->getFile() . " على السطر: " . $e->getLine());
            return response()->json(['success' => false, 'message' => 'حدث خطأ غير متوقع أثناء إنشاء الفاتورة.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * عرض تفاصيل فاتورة شراء محددة
     */
    public function show(string $id)
    {
        $invoice = PurchaseInvoice::with([
            'supplier', 
            'items.product', 
            'creator',
            'returns'
        ])->find($id);

        if (!$invoice) {
            return response()->json([
                'success' => false,
                'message' => 'الفاتورة غير موجودة',
            ], 404);
        }

        $invoice->items->each(function($item) use ($invoice) {
            $item->returned_quantity = $invoice->getReturnedQuantity($item->product_id);
            $item->available_return_quantity = $invoice->getAvailableReturnQuantity($item->product_id);
        });

        return response()->json([
            'success' => true,
            'data' => $invoice,
        ]);
    }

    /**
     * تحديث فاتورة شراء موجودة
     */
    public function update(Request $request, string $id)
    {
        $invoice = PurchaseInvoice::find($id);

        if (!$invoice) {
            return response()->json([
                'success' => false,
                'message' => 'الفاتورة غير موجودة',
            ], 404);
        }

        $validated = $request->validate([
            'paid_amount' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:completed,pending,cancelled',
            'notes' => 'nullable|string',
        ]);

        $invoice->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث الفاتورة بنجاح',
            'data' => $invoice->load(['supplier', 'items.product', 'creator']),
        ]);
    }

    /**
     * حذف فاتورة شراء
     */
    public function destroy(string $id)
    {
        $invoice = PurchaseInvoice::find($id);

        if (!$invoice) {
            return response()->json([
                'success' => false,
                'message' => 'الفاتورة غير موجودة',
            ], 404);
        }

        DB::beginTransaction();
        
        try {
            ProductStockBatch::where('purchase_invoice_id', $invoice->id)->delete();
            $invoice->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم حذف الفاتورة بنجاح',
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * الحصول على قائمة المنتجات في فاتورة مع الكميات المتاحة للإرجاع
     */
    public function getItemsForReturn(string $id)
    {
        $invoice = PurchaseInvoice::with(['items.product'])->find($id);

        if (!$invoice) {
            return response()->json([
                'success' => false,
                'message' => 'الفاتورة غير موجودة',
            ], 404);
        }

        $items = $invoice->items->map(function($item) use ($invoice) {
            return [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product->name ?? 'منتج محذوف',
                'product_image' => $item->product->image_url ?? null,
                'original_quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'returned_quantity' => $invoice->getReturnedQuantity($item->product_id),
                'sold_quantity' => $item->sold_quantity,
                'available_return_quantity' => $invoice->getAvailableReturnQuantity($item->product_id),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'invoice_number' => $invoice->invoice_number,
                'invoice_date' => $invoice->invoice_date,
                'supplier' => $invoice->supplier,
                'items' => $items,
            ],
        ]);
    }
}
