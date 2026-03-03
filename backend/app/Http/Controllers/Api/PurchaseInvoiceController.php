<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PurchaseInvoice;
use App\Models\PurchaseInvoiceItem;
use App\Services\InventoryService; // ✅ [إضافة] استيراد خدمة المخزون الجديدة
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PurchaseInvoiceController extends Controller
{
    protected InventoryService $inventoryService;

    // ✅ [إضافة] حقن خدمة المخزون في الـ constructor
    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    /**
     * عرض قائمة فواتير المشتريات مع الفلترة
     */
    public function index(Request $request)
    {
        // ... (هذه الدالة تبقى كما هي بدون تغيير)
        $query = PurchaseInvoice::with(['supplier', 'items.inventoryItem', 'creator']); // [تعديل بسيط] تغيير product إلى inventoryItem

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
        // [تعديل] تحديث قواعد التحقق لتطابق جدول inventory_items
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'invoice_date' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.inventory_item_id' => 'required|exists:inventory_items,id', // ✅ التغيير هنا
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0', // ✅ التغيير هنا
        ]);

        try {
            $invoice = DB::transaction(function () use ($validated, $request) {
                // 1. إنشاء فاتورة الشراء الرئيسية
                $invoice = PurchaseInvoice::create([
                    'supplier_id' => $validated['supplier_id'],
                    'invoice_date' => $validated['invoice_date'],
                    'invoice_number' => 'PUR-' . date('Ymd') . '-' . str_pad(PurchaseInvoice::count() + 1, 4, '0', STR_PAD_LEFT),
                    'created_by' => $request->user()->id,
                    'total_amount' => 0, // قيمة أولية
                ]);

                $totalInvoiceAmount = 0;

                // 2. معالجة كل عنصر وربطه بالمخزون
                foreach ($validated['items'] as $itemData) {
                    $totalItemPrice = $itemData['quantity'] * $itemData['unit_price'];

                    // إنشاء سجل صنف الفاتورة
                    PurchaseInvoiceItem::create([
                        'purchase_invoice_id' => $invoice->id,
                        'inventory_item_id' => $itemData['inventory_item_id'], // ✅ التغيير هنا
                        'quantity' => $itemData['quantity'],
                        'unit_price' => $itemData['unit_price'],
                        'total_price' => $totalItemPrice,
                    ]);

                    // 3. [الربط هنا] استدعاء خدمة المخزون لزيادة الكمية
                    $this->inventoryService->addStock(
                        $itemData['inventory_item_id'],
                        $itemData['quantity'],
                        $itemData['unit_price'],
                        PurchaseInvoice::class, // مصدر الحركة
                        $invoice->id, // رقم الفاتورة
                        'إضافة من فاتورة شراء رقم ' . $invoice->id
                    );

                    $totalInvoiceAmount += $totalItemPrice;
                }

                // 4. تحديث المبلغ الإجمالي للفاتورة
                $invoice->total_amount = $totalInvoiceAmount;
                $invoice->save();

                return $invoice;
            });

            return response()->json(['success' => true, 'message' => 'تم إنشاء فاتورة الشراء وزيادة المخزون بنجاح.', 'data' => $invoice], 201);

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
        // [تعديل] تغيير product إلى inventoryItem
        $invoice = PurchaseInvoice::with([
            'supplier', 
            'items.inventoryItem', 
            'creator',
        ])->find($id);

        if (!$invoice) {
            return response()->json([
                'success' => false,
                'message' => 'الفاتورة غير موجودة',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $invoice,
        ]);
    }

    // ... (دوال update و destroy و getItemsForReturn تحتاج إلى إعادة نظر في منطقها لتتوافق مع النظام الجديد، ولكنها خارج نطاق الربط الحالي)
}
