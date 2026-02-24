<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SalesInvoice;
use App\Models\SalesInvoiceItem;
use App\Models\Product;
use App\Models\Debt;
use App\Models\Customer;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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
        $invoices = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 50));
        return response()->json(['success' => true, 'data' => $invoices]);
    }

    public function store(Request $request)
    {
        // =================================================================
        // **التصحيح الوحيد هنا: إضافة 'wallet' إلى قائمة طرق الدفع المسموح بها**
        // =================================================================
        $validated = $request->validate([
            'customer_id' => 'required_if:payment_method,debt|nullable|exists:customers,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            // **هذا هو السطر الذي تم تعديله**
            'payment_method' => 'required|in:cash,card,transfer,debt,wallet', 
            'notes' => 'nullable|string',
            // إضافة حقول المحفظة لتكون اختيارية
            'walletType' => 'nullable|string|max:255',
            'transactionCode' => 'nullable|string|max:255',
        ], ['customer_id.required_if' => 'يجب اختيار عميل عند تحديد طريقة الدفع "دين".']);

        try {
            $invoice = DB::transaction(function () use ($validated) {
                
                $productIds = array_column($validated['items'], 'product_id');
                $products = Product::whereIn('id', $productIds)->lockForUpdate()->get()->keyBy('id');

                foreach ($validated['items'] as $item) {
                    $product = $products->get($item['product_id']);
                    if (!$product || $product->quantity < $item['quantity']) {
                        $productName = $product ? $product->name : "ID: {$item['product_id']}";
                        throw new \Exception("المخزون غير كافٍ للمنتج: {$productName}");
                    }
                }

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
                    'notes' => $validated['notes'] ?? null,
                    'status' => 'completed',
                    // إضافة: حفظ بيانات المحفظة إذا كانت موجودة
                    'wallet_type' => $validated['walletType'] ?? null,
                    'transaction_code' => $validated['transactionCode'] ?? null,
                ]);

                foreach ($validated['items'] as $item) {
                    $product = $products->get($item['product_id']);
                    
                    SalesInvoiceItem::create([
                        'sales_invoice_id' => $invoice->id,
                        'product_id' => $item['product_id'],
                        'quantity' => $item['quantity'],
                        'purchase_price' => $product->purchase_price,
                        'unit_price' => $item['price'],
                        'total_price' => $item['quantity'] * $item['price'],
                    ]);
                    
                    Product::where('id', $product->id)->decrement('quantity', $item['quantity']);
                }

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

                return $invoice;
            });

            return response()->json([
                'success' => true,
                'message' => 'تم إنشاء الفاتورة بنجاح.',
                'data' => $invoice->load(['items.product', 'customer']),
            ], 201);
            
        } catch (\Exception $e) {
            Log::error("خطأ في إنشاء فاتورة البيع: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    private function addLoyaltyPoints(SalesInvoice $invoice)
    {
        $loyaltySettings = cache()->remember('loyalty_settings', 3600, function () {
            return SystemSetting::whereIn('key', ['loyalty_enabled', 'loyalty_points_per_currency'])->pluck('value', 'key');
        });
        
        if (($loyaltySettings['loyalty_enabled'] ?? false) && $invoice->customer_id) {
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
