<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PurchaseReturn;
use App\Models\PurchaseInvoice;
use App\Models\Product;
use Illuminate\Http\Request;

/**
 * متحكم مرتجعات المشتريات
 * 
 * يدير جميع العمليات المتعلقة بإرجاع المنتجات للموردين
 * مع التحقق من الكميات المتاحة والمباعة
 */
class PurchaseReturnController extends Controller
{
    /**
     * عرض قائمة المرتجعات مع الفلترة
     * 
     * يدعم:
     * - الفلترة حسب نطاق التاريخ
     * - البحث برقم المرتجع
     * - الفلترة حسب الفاتورة
     * - الفلترة حسب الحالة
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // استعلام أساسي مع تحميل العلاقات
        $query = PurchaseReturn::with([
            'purchaseInvoice.supplier', 
            'product', 
            'creator'
        ]);

        // الفلترة حسب تاريخ البداية
        if ($request->has('from_date') && $request->from_date) {
            $query->whereDate('return_date', '>=', $request->from_date);
        }
        
        // الفلترة حسب تاريخ النهاية
        if ($request->has('to_date') && $request->to_date) {
            $query->whereDate('return_date', '<=', $request->to_date);
        }

        // البحث برقم المرتجع
        if ($request->has('search') && $request->search) {
            $query->where('return_number', 'like', '%' . $request->search . '%');
        }

        // الفلترة حسب فاتورة الشراء
        if ($request->has('purchase_invoice_id') && $request->purchase_invoice_id) {
            $query->where('purchase_invoice_id', $request->purchase_invoice_id);
        }

        // الفلترة حسب الحالة
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // الترتيب حسب الأحدث أولاً مع الترقيم
        $returns = $query->orderBy('return_date', 'desc')
                         ->paginate($request->get('per_page', 50));

        return response()->json([
            'success' => true,
            'data' => $returns,
        ]);
    }

    /**
     * إنشاء مرتجع جديد
     * 
     * العملية:
     * 1. التحقق من وجود الفاتورة والمنتج
     * 2. التحقق من الكمية المتاحة للإرجاع
     * 3. توليد رقم مرتجع تلقائي (RET-YYYYMMDD-XXXX)
     * 4. إنشاء المرتجع
     * 5. خصم الكمية من المخزون
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // التحقق من صحة البيانات
        $validated = $request->validate([
            'purchase_invoice_id' => 'required|exists:purchase_invoices,id',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'reason' => 'nullable|string',
            'return_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        // بدء معاملة قاعدة البيانات
        \DB::beginTransaction();
        
        try {
            // الحصول على الفاتورة
            $invoice = PurchaseInvoice::with('items')->find($validated['purchase_invoice_id']);
            
            if (!$invoice) {
                throw new \Exception('الفاتورة غير موجودة');
            }

            // الحصول على عنصر الفاتورة للمنتج المحدد
            $invoiceItem = $invoice->items()
                                   ->where('product_id', $validated['product_id'])
                                   ->first();
            
            if (!$invoiceItem) {
                throw new \Exception('المنتج غير موجود في هذه الفاتورة');
            }

            // التحقق من الكمية المتاحة للإرجاع
            $availableQuantity = $invoice->getAvailableReturnQuantity($validated['product_id']);
            
            if ($validated['quantity'] > $availableQuantity) {
                throw new \Exception(
                    "الكمية المتاحة للإرجاع هي {$availableQuantity} فقط. " .
                    "تم بيع " . $invoiceItem->sold_quantity . " من هذا المنتج."
                );
            }

            // توليد رقم المرتجع التلقائي
            // الصيغة: RET-YYYYMMDD-XXXX (مثال: RET-20231220-0001)
            $lastReturn = PurchaseReturn::orderBy('id', 'desc')->first();
            $returnNumber = 'RET-' . date('Ymd') . '-' . str_pad(
                ($lastReturn ? $lastReturn->id + 1 : 1), 
                4, 
                '0', 
                STR_PAD_LEFT
            );

            // حساب السعر الإجمالي للمرتجع
            $totalPrice = $validated['quantity'] * $invoiceItem->unit_price;

            // إنشاء المرتجع
            $return = PurchaseReturn::create([
                'return_number' => $returnNumber,
                'purchase_invoice_id' => $validated['purchase_invoice_id'],
                'product_id' => $validated['product_id'],
                'quantity' => $validated['quantity'],
                'unit_price' => $invoiceItem->unit_price,
                'total_price' => $totalPrice,
                'reason' => $validated['reason'] ?? null,
                'return_date' => $validated['return_date'],
                'status' => 'pending',
                'notes' => $validated['notes'] ?? null,
                'created_by' => auth()->id(),
            ]);

            // خصم الكمية من المخزون
            $product = Product::find($validated['product_id']);
            if ($product) {
                $product->decrement('quantity', $validated['quantity']);
            }

            // تأكيد المعاملة
            \DB::commit();

            // إرجاع المرتجع الكامل مع العلاقات
            return response()->json([
                'success' => true,
                'message' => 'تم إنشاء المرتجع بنجاح',
                'data' => $return->load(['purchaseInvoice.supplier', 'product', 'creator']),
            ], 201);
            
        } catch (\Exception $e) {
            // التراجع عن جميع التغييرات في حالة الخطأ
            \DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * عرض تفاصيل مرتجع محدد
     * 
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(string $id)
    {
        $return = PurchaseReturn::with([
            'purchaseInvoice.supplier', 
            'product', 
            'creator'
        ])->find($id);

        if (!$return) {
            return response()->json([
                'success' => false,
                'message' => 'المرتجع غير موجود',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $return,
        ]);
    }

    /**
     * تحديث حالة مرتجع
     * 
     * @param Request $request
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, string $id)
    {
        $return = PurchaseReturn::find($id);

        if (!$return) {
            return response()->json([
                'success' => false,
                'message' => 'المرتجع غير موجود',
            ], 404);
        }

        // التحقق من صحة البيانات
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected',
            'notes' => 'nullable|string',
        ]);

        \DB::beginTransaction();
        
        try {
            $oldStatus = $return->status;
            $newStatus = $validated['status'];

            // إذا تم رفض المرتجع بعد أن كان معلقاً، نعيد الكمية للمخزون
            if ($oldStatus === 'pending' && $newStatus === 'rejected') {
                $product = Product::find($return->product_id);
                if ($product) {
                    $product->increment('quantity', $return->quantity);
                }
            }

            // تحديث المرتجع
            $return->update($validated);

            \DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم تحديث حالة المرتجع بنجاح',
                'data' => $return->load(['purchaseInvoice.supplier', 'product', 'creator']),
            ]);
            
        } catch (\Exception $e) {
            \DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * حذف مرتجع
     * 
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(string $id)
    {
        $return = PurchaseReturn::find($id);

        if (!$return) {
            return response()->json([
                'success' => false,
                'message' => 'المرتجع غير موجود',
            ], 404);
        }

        \DB::beginTransaction();
        
        try {
            // إذا كان المرتجع معلقاً أو معتمداً، نعيد الكمية للمخزون
            if ($return->status !== 'rejected') {
                $product = Product::find($return->product_id);
                if ($product) {
                    $product->increment('quantity', $return->quantity);
                }
            }

            $return->delete();

            \DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم حذف المرتجع بنجاح',
            ]);
            
        } catch (\Exception $e) {
            \DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
