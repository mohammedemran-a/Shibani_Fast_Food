<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PurchaseInvoice;
use App\Models\PurchaseInvoiceItem;
use App\Models\Product;
use Illuminate\Http\Request;

/**
 * متحكم فواتير المشتريات
 * 
 * يدير جميع العمليات المتعلقة بفواتير الشراء من الموردين
 * مع دعم الترقيم التلقائي والضريبة والخصم
 */
class PurchaseInvoiceController extends Controller
{
    /**
     * عرض قائمة فواتير المشتريات مع الفلترة
     * 
     * يدعم:
     * - الفلترة حسب نطاق التاريخ
     * - البحث برقم الفاتورة
     * - الفلترة حسب المورد
     * - الترقيم الديناميكي
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // استعلام أساسي مع تحميل العلاقات
        $query = PurchaseInvoice::with(['supplier', 'items.product', 'creator']);

        // الفلترة حسب تاريخ البداية
        if ($request->has('from_date') && $request->from_date) {
            $query->whereDate('invoice_date', '>=', $request->from_date);
        }
        
        // الفلترة حسب تاريخ النهاية
        if ($request->has('to_date') && $request->to_date) {
            $query->whereDate('invoice_date', '<=', $request->to_date);
        }

        // البحث برقم الفاتورة
        if ($request->has('search') && $request->search) {
            $query->where('invoice_number', 'like', '%' . $request->search . '%');
        }

        // الفلترة حسب المورد
        if ($request->has('supplier_id') && $request->supplier_id) {
            $query->where('supplier_id', $request->supplier_id);
        }

        // الفلترة حسب الحالة
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // الترتيب حسب الأحدث أولاً مع الترقيم
        $invoices = $query->orderBy('invoice_date', 'desc')
                          ->paginate($request->get('per_page', 50));

        return response()->json([
            'success' => true,
            'data' => $invoices,
        ]);
    }

    /**
     * إنشاء فاتورة شراء جديدة
     * 
     * العملية:
     * 1. توليد رقم فاتورة تلقائي (PUR-YYYYMMDD-XXXX)
     * 2. حساب المجموع الفرعي والضريبة والخصم
     * 3. إنشاء الفاتورة الرئيسية
     * 4. إنشاء عناصر الفاتورة (المنتجات)
     * 5. إضافة الكميات إلى المخزون
     * 6. إرجاع الفاتورة الكاملة مع العلاقات
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // التحقق من صحة البيانات
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'invoice_date' => 'required|date',
            'due_date' => 'nullable|date|after_or_equal:invoice_date',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'paid_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        // بدء معاملة قاعدة البيانات
        \DB::beginTransaction();
        
        try {
            // حساب المجموع الفرعي (مجموع أسعار جميع المنتجات)
            $subtotal = 0;
            foreach ($validated['items'] as $item) {
                $subtotal += $item['quantity'] * $item['unit_price'];
            }

            // حساب الضريبة والخصم
            $taxAmount = $validated['tax_amount'] ?? 0;
            $discountAmount = $validated['discount_amount'] ?? 0;

            // حساب المجموع الإجمالي
            $totalAmount = $subtotal + $taxAmount - $discountAmount;

            // توليد رقم الفاتورة التلقائي
            // الصيغة: PUR-YYYYMMDD-XXXX (مثال: PUR-20231220-0001)
            $lastInvoice = PurchaseInvoice::orderBy('id', 'desc')->first();
            $invoiceNumber = 'PUR-' . date('Ymd') . '-' . str_pad(
                ($lastInvoice ? $lastInvoice->id + 1 : 1), 
                4, 
                '0', 
                STR_PAD_LEFT
            );

            // إنشاء الفاتورة الرئيسية
            $invoice = PurchaseInvoice::create([
                'invoice_number' => $invoiceNumber,
                'supplier_id' => $validated['supplier_id'],
                'invoice_date' => $validated['invoice_date'],
                'due_date' => $validated['due_date'] ?? null,
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'discount_amount' => $discountAmount,
                'total_amount' => $totalAmount,
                'paid_amount' => $validated['paid_amount'] ?? 0,
                'status' => 'completed',
                'notes' => $validated['notes'] ?? null,
                'created_by' => auth()->id(),
            ]);

            // معالجة عناصر الفاتورة (المنتجات)
            foreach ($validated['items'] as $item) {
                // إنشاء عنصر الفاتورة
                PurchaseInvoiceItem::create([
                    'purchase_invoice_id' => $invoice->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $item['quantity'] * $item['unit_price'],
                ]);
                
                // إضافة الكمية إلى المخزون
                $product = Product::find($item['product_id']);
                if ($product) {
                    $product->increment('quantity', $item['quantity']);
                }
            }

            // تأكيد المعاملة
            \DB::commit();

            // إرجاع الفاتورة الكاملة مع العلاقات
            return response()->json([
                'success' => true,
                'message' => 'تمت إضافة فاتورة الشراء بنجاح',
                'data' => $invoice->load(['supplier', 'items.product', 'creator']),
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
     * عرض تفاصيل فاتورة شراء محددة
     * 
     * يتضمن:
     * - بيانات الفاتورة الأساسية
     * - بيانات المورد
     * - عناصر الفاتورة مع تفاصيل المنتجات
     * - الكميات المرتجعة والمتاحة للإرجاع لكل منتج
     * 
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
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

        // إضافة معلومات الكميات المتاحة للإرجاع لكل منتج
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
     * 
     * @param Request $request
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
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

        // التحقق من صحة البيانات
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
     * 
     * تحذير: سيتم حذف جميع عناصر الفاتورة والمرتجعات المرتبطة
     * 
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
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

        \DB::beginTransaction();
        
        try {
            // خصم الكميات من المخزون قبل الحذف
            foreach ($invoice->items as $item) {
                $product = Product::find($item->product_id);
                if ($product) {
                    $product->decrement('quantity', $item->quantity);
                }
            }

            $invoice->delete();

            \DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم حذف الفاتورة بنجاح',
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
     * الحصول على قائمة المنتجات في فاتورة مع الكميات المتاحة للإرجاع
     * 
     * يستخدم في صفحة المرتجعات لعرض المنتجات المتاحة للإرجاع
     * 
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
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

        // إضافة معلومات الكميات لكل منتج
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
