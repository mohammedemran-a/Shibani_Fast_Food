<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SalesInvoiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
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

        \DB::beginTransaction();
        try {
            // Create sales invoice
            $invoice = \App\Models\SalesInvoice::create([
                'customer_id' => $validated['customer_id'] ?? null,
                'subtotal' => $validated['subtotal'],
                'tax' => $validated['tax'] ?? 0,
                'discount' => $validated['discount'] ?? 0,
                'total' => $validated['total'],
                'payment_method' => $validated['payment_method'],
                'notes' => $validated['notes'] ?? null,
                'status' => 'completed',
            ]);

            // Create invoice items and update stock
            foreach ($validated['items'] as $item) {
                $product = \App\Models\Product::findOrFail($item['product_id']);
                
                // Check stock availability
                if ($product->quantity < $item['quantity']) {
                    throw new \Exception("Insufficient stock for product: {$product->name}");
                }
                
                // Create invoice item
                \App\Models\SalesInvoiceItem::create([
                    'sales_invoice_id' => $invoice->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['price'],
                    'total_price' => $item['quantity'] * $item['price'],
                ]);
                
                // Deduct from stock
                $product->decrement('quantity', $item['quantity']);
            }

            \DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Sale completed successfully',
                'data' => $invoice->load(['items.product', 'customer']),
            ], 201);
        } catch (\Exception $e) {
            \DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
