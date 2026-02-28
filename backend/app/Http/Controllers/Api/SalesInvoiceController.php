<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSalesInvoiceRequest; // سنستخدم هذا لاحقًا أو ندمج التحقق هنا
use App\Models\Product;
use App\Models\SalesInvoice;
use App\Models\SalesInvoiceItem; // استيراد الموديل
use App\Models\Customer;
use App\Models\Debt;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

/**
 * متحكم فواتير البيع (Sales Invoice Controller) - النسخة النهائية والمحصنة
 * 
 * يدير عملية إنشاء فواتير البيع مع تطبيق منطق المخزون المتقدم (FIFO) ودعم الوحدات المتعددة.
 */
class SalesInvoiceController extends Controller
{
    // دالة index تبقى كما هي بدون تغيير
    public function index(Request $request)
    {
        $query = SalesInvoice::with(['customer', 'items.product']);
        if ($request->has('from_date') && $request->from_date) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->has('to_date') && $request->to_date) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }
        if ($request->has('search') && $request->search) {
            $query->where('invoice_number', 'like', '%' . $request->search . '%');
        }
        $invoices = $query->latest()->paginate($request->get('per_page', 50));
        return response()->json(['success' => true, 'data' => $invoices]);
    }

    /**
     * إنشاء فاتورة بيع جديدة مع تطبيق منطق FIFO لسحب المخزون (النسخة النهائية).
     */
    public function store(Request $request)
    {
        // 1. التحقق من صحة البيانات (مُحسَّن ليدعم barcode_id)
        $validated = $request->validate([
            'customer_id' => 'required_if:payment_method,debt|nullable|exists:customers,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.barcode_id' => 'required|exists:product_barcodes,id', // ✅ مهم جدًا
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,wallet,debt',
            'notes' => 'nullable|string',
            'wallet_type' => 'nullable|string|max:255',
            'transaction_code' => 'nullable|string|max:255',
        ], [
            'customer_id.required_if' => 'يجب اختيار عميل عند تحديد طريقة الدفع "دين".',
            'items.*.barcode_id.required' => 'معرف الباركود مطلوب لكل عنصر.',
        ]);

        try {
            // 2. استخدام Transaction لضمان سلامة جميع عمليات قاعدة البيانات
            $invoice = DB::transaction(function () use ($validated) {
                
                // 3. إنشاء الفاتورة الرئيسية
                $lastInvoiceId = SalesInvoice::latest('id')->value('id') ?? 0;
                $invoiceNumber = 'INV-' . date('Ymd') . '-' . str_pad($lastInvoiceId + 1, 4, '0', STR_PAD_LEFT);

                $invoice = SalesInvoice::create([
                    'invoice_number' => $invoiceNumber,
                    'customer_id' => $validated['customer_id'] ?? null,
                    'cashier_id' => auth()->id(),
                    'invoice_date' => now(),
                    'subtotal' => $validated['subtotal'],
                    'tax_amount' => $validated['tax'] ?? 0,
                    'discount_amount' => $validated['discount'] ?? 0,
                    'total_amount' => $validated['total'],
                    'payment_method' => $validated['payment_method'],
                    'wallet_name' => $validated['wallet_type'] ?? null, // تصحيح اسم الحقل
                    'transaction_code' => $validated['transaction_code'] ?? null,
                    'notes' => $validated['notes'] ?? null,
                    'status' => 'completed',
                ]);

                // 4. **المنطق الجوهري: معالجة كل عنصر وتطبيق FIFO**
                foreach ($validated['items'] as $itemData) {
                    $product = Product::with('barcodes')->findOrFail($itemData['product_id']);
                    $barcode = $product->barcodes->find($itemData['barcode_id']);

                    if (!$barcode) {
                        throw new \Exception("الوحدة (الباركود) غير صالحة للمنتج {$product->name}.");
                    }

                    // تحويل الكمية المباعة إلى الوحدة الأساسية
                    $quantityInBaseUnits = $itemData['quantity'] * $barcode->unit_quantity;

                    // خصم المخزون باستخدام دالة FIFO المخصصة
                    $averageCostPrice = $this->updateStock($product, $quantityInBaseUnits);

                    // إنشاء سجل عنصر الفاتورة مع سعر التكلفة الدقيق
                    SalesInvoiceItem::create([
                        'sales_invoice_id' => $invoice->id,
                        'product_id' => $itemData['product_id'],
                        'barcode_id' => $itemData['barcode_id'],
                        'quantity' => $itemData['quantity'],
                        'unit_price' => $itemData['unit_price'],
                        'cost_price_per_unit' => $averageCostPrice / $barcode->unit_quantity, // تحويل التكلفة لتناسب الوحدة المباعة
                        'total_price' => $itemData['quantity'] * $itemData['unit_price'],
                    ]);
                }

                // 5. معالجة الديون ونقاط الولاء
                if ($validated['payment_method'] === 'debt') {
                    Debt::create([
                        'customer_id' => $invoice->customer_id,
                        'sales_invoice_id' => $invoice->id,
                        'amount' => $invoice->total_amount,
                        'paid_amount' => 0,
                        'remaining_amount' => $invoice->total_amount,
                        'notes' => 'دين ناتج عن الفاتورة رقم ' . $invoice->invoice_number,
                    ]);
                }
                $this->addLoyaltyPoints($invoice);

                // تحديث آخر تاريخ شراء للعميل
                if ($invoice->customer) {
                    $invoice->customer->touch('last_purchase_at');
                }

                return $invoice;
            });

            return response()->json([
                'success' => true,
                'message' => 'تم إنشاء الفاتورة وخصم المخزون بنجاح.',
                'data' => $invoice->load(['items.product', 'customer']),
            ], 201);
            
        } catch (ValidationException $e) {
            // يلتقط خطأ عدم كفاية المخزون من دالة updateStock
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        } catch (\Exception $e) {
            Log::error("خطأ في إنشاء فاتورة البيع: " . $e->getMessage() . " في الملف: " . $e->getFile() . " على السطر: " . $e->getLine());
            return response()->json(['success' => false, 'message' => 'حدث خطأ غير متوقع أثناء إنشاء الفاتورة.'], 500);
        }
    }

    /**
     * دالة FIFO المحصنة: تخصم المخزون وتحسب متوسط التكلفة.
     *
     * @param Product $product المنتج المراد تحديث مخزونه.
     * @param float $quantityToDeduct الكمية المراد خصمها (بالوحدة الأساسية).
     * @return float متوسط تكلفة الشراء للكمية المسحوبة.
     * @throws ValidationException إذا كان المخزون غير كافٍ.
     */
    protected function updateStock(Product $product, float $quantityToDeduct): float
    {
        $product = Product::lockForUpdate()->find($product->id);
        $totalStock = $product->stockBatches()->sum('quantity_remaining');

        if ($totalStock < $quantityToDeduct) {
            throw ValidationException::withMessages([
                'stock' => "المخزون غير كافٍ للمنتج '{$product->name}'. المطلوب: {$quantityToDeduct}, المتوفر: {$totalStock}",
            ]);
        }

        $batches = $product->stockBatches()
            ->where('quantity_remaining', '>', 0)
            ->orderByRaw('ISNULL(expiry_date) ASC, expiry_date ASC, created_at ASC')
            ->get();

        $remainingToDeduct = $quantityToDeduct;
        $totalCostOfDeductedItems = 0;

        foreach ($batches as $batch) {
            if ($remainingToDeduct <= 0) break;

            $deductFromThisBatch = min($batch->quantity_remaining, $remainingToDeduct);
            
            $batch->decrement('quantity_remaining', $deductFromThisBatch);
            
            $totalCostOfDeductedItems += $deductFromThisBatch * $batch->purchase_price_per_unit;
            
            $remainingToDeduct -= $deductFromThisBatch;
        }

        if ($quantityToDeduct > 0) {
            return $totalCostOfDeductedItems / $quantityToDeduct;
        }
        return 0;
    }

    // دالة addLoyaltyPoints تبقى كما هي بدون تغيير
    private function addLoyaltyPoints(SalesInvoice $invoice)
    {
        $loyaltySettings = cache()->remember('loyalty_settings', 3600, function () {
            return SystemSetting::whereIn('key', ['loyalty_enabled', 'loyalty_points_per_currency'])->pluck('value', 'key');
        });
        
        if (($loyaltySettings['loyalty_enabled'] ?? 'false') === 'true' && $invoice->customer_id) {
            $pointsRatio = (float)($loyaltySettings['loyalty_points_per_currency'] ?? 0);
            if ($pointsRatio > 0) {
                $earnedPoints = floor($invoice->total_amount * $pointsRatio);
                if ($earnedPoints > 0) {
                    Customer::where('id', $invoice->customer_id)->increment('loyalty_points', $earnedPoints);
                }
            }
        }
    }
}
