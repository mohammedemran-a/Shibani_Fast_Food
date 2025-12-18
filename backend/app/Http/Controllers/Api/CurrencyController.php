<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Currency;
use Illuminate\Http\Request;

class CurrencyController extends Controller
{
    public function index()
    {
        $currencies = Currency::all();
        return response()->json(['success' => true, 'data' => $currencies]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'code' => 'required|string|unique:currencies',
            'symbol' => 'required|string',
            'exchange_rate' => 'numeric|min:0',
            'is_default' => 'boolean',
        ]);

        $currency = Currency::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Currency created successfully',
            'data' => $currency,
        ], 201);
    }

    public function show(Currency $currency)
    {
        return response()->json(['success' => true, 'data' => $currency]);
    }

    public function update(Request $request, Currency $currency)
    {
        $validated = $request->validate([
            'name' => 'string',
            'code' => 'string|unique:currencies,code,' . $currency->id,
            'symbol' => 'string',
            'exchange_rate' => 'numeric|min:0',
            'is_default' => 'boolean',
        ]);

        $currency->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Currency updated successfully',
            'data' => $currency,
        ]);
    }

    public function destroy(Currency $currency)
    {
        $currency->delete();

        return response()->json([
            'success' => true,
            'message' => 'Currency deleted successfully',
        ]);
    }
}
