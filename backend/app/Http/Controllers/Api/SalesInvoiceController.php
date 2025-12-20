<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * متحكم فواتير المبيعات
 * 
 * يدير جميع العمليات المتعلقة بفواتير البيع
 * مع دعم إنشاء الفواتير، خصم المخزون، والبحث
 */
class SalesInvoiceController extends Controller
{
    /**
     * عرض قائمة فواتير المبيعات مع الفلترة
     * 
     * يدعم:
     * - الفلترة حسب نطاق التاريخ (from_date, to_date)
     * - البحث برقم الفاتورة
     * - الترقيم الديناميكي
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // استعلام أساسي مع تحميل العلاقات
        $query = \App\Models\SalesInvoice::with(['customer', 'items.product']);

        // الفلترة حسب تاريخ البداية
        if ($request->has('from_date') && $request->from_date) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        
        // الفلترة حسب تاريخ النهاية
        if ($request->has('to_date') && $request->to_date) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        // البحث برقم الفاتورة
        if ($request->has('search') && $request->search) {
            $query->where('invoice_number', 'like', '%' . $request->search . '%');
        }

        // الترتيب حسب الأحدث أولاً مع الترقيم
        $invoices = $query->orderBy('created_at', 'desc')
                          ->paginate($request->get('per_page', 50));

        return response()->json([
            'success' => true,
            'data' => $invoices,
        ]);
    }

    /**
     * إنشاء فاتورة بيع جديدة
     * 
     * العملية:
     * 1. توليد رقم فاتورة تلقائي (INV-YYYYMMDD-XXXX)
     * 2. إنشاء الفاتورة الرئيسية
     * 3. إنشاء عناصر الفاتورة (المنتجات)
     * 4. التحقق من توفر المخزون
     * 5. خصم الكميات من المخزون
     * 6. إرجاع الفاتورة الكاملة مع العلاقات
     * 
     * ملاحظة: جميع العمليات تتم داخل transaction لضمان سلامة البيانات
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // التحقق من صحة البيانات
        $validated = $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,card,transfer',
            'notes' => 'nullable|string',
        ]);

        // بدء معاملة قاعدة البيانات
        \DB::beginTransaction();
        
        try {
            // توليد رقم الفاتورة التلقائي
            // الصيغة: INV-YYYYMMDD-XXXX (مثال: INV-20231220-0001)
            $lastInvoice = \App\Models\SalesInvoice::orderBy('id', 'desc')->first();
            $invoiceNumber = 'INV-' . date('Ymd') . '-' . str_pad(
                ($lastInvoice ? $lastInvoice->id + 1 : 1), 
                4, 
                '0', 
                STR_PAD_LEFT
            );

            // إنشاء الفاتورة الرئيسية
            $invoice = \App\Models\SalesInvoice::create([
                'invoice_number' => $invoiceNumber,
                'customer_id' => $validated['customer_id'] ?? null,
                'cashier_id' => auth()->id(),
                'invoice_date' => now(),
                'subtotal' => $validated['subtotal'],
                'tax_amount' => $validated['tax'] ?? 0,
                'discount_amount' => $validated['discount'] ?? 0,
                'total_amount' => $validated['total'],
                'payment_method' => $validated['payment_method'],
                'notes' => $validated['notes'] ?? null,
                'status' => 'completed',
            ]);

            // معالجة عناصر الفاتورة (المنتجات)
            foreach ($validated['items'] as $item) {
                // جلب المنتج
                $product = \App\Models\Product::findOrFail($item['product_id']);
                
                // التحقق من توفر المخزون
                if ($product->quantity < $item['quantity']) {
                    throw new \Exception("المخزون غير كافٍ للمنتج: {$product->name}");
                }
                
                // إنشاء عنصر الفاتورة
                \App\Models\SalesInvoiceItem::create([
                    'sales_invoice_id' => $invoice->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['price'],
                    'total_price' => $item['quantity'] * $item['price'],
                ]);
                
                // خصم الكمية من المخزون
                $product->decrement('quantity', $item['quantity']);
            }

            // تأكيد المعاملة
            \DB::commit();

            // إرجاع الفاتورة الكاملة مع العلاقات
            return response()->json([
                'success' => true,
                'message' => 'تمت عملية البيع بنجاح',
                'data' => $invoice->load(['items.product', 'customer']),
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
     * عرض تفاصيل فاتورة محددة
     * 
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(string $id)
    {
        $invoice = \App\Models\SalesInvoice::with(['customer', 'items.product', 'cashier'])
                                           ->find($id);

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

    /**
     * إلغاء فاتورة (تغيير الحالة إلى cancelled)
     * 
     * ملاحظة: يجب إرجاع الكميات إلى المخزون عند الإلغاء
     * 
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function cancel(string $id)
    {
        $invoice = \App\Models\SalesInvoice::with('items')->find($id);

        if (!$invoice) {
            return response()->json([
                'success' => false,
                'message' => 'الفاتورة غير موجودة',
            ], 404);
        }

        if ($invoice->status === 'cancelled') {
            return response()->json([
                'success' => false,
                'message' => 'الفاتورة ملغاة بالفعل',
            ], 422);
        }

        \DB::beginTransaction();
        
        try {
            // إرجاع الكميات إلى المخزون
            foreach ($invoice->items as $item) {
                $product = \App\Models\Product::find($item->product_id);
                if ($product) {
                    $product->increment('quantity', $item->quantity);
                }
            }

            // تحديث حالة الفاتورة
            $invoice->update(['status' => 'cancelled']);

            \DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم إلغاء الفاتورة بنجاح',
                'data' => $invoice,
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
     * حذف فاتورة نهائياً
     * 
     * تحذير: هذه العملية غير قابلة للتراجع
     * 
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(string $id)
    {
        $invoice = \App\Models\SalesInvoice::find($id);

        if (!$invoice) {
            return response()->json([
                'success' => false,
                'message' => 'الفاتورة غير موجودة',
            ], 404);
        }

        $invoice->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف الفاتورة بنجاح',
        ]);
    }
}
