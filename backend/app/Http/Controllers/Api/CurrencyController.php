<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Currency;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; // 1. إضافة استيراد DB

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

        // =================================================================
        // **2. إضافة منطق ذكي عند إنشاء عملة افتراضية جديدة**
        // =================================================================
        DB::transaction(function () use ($validated, &$currency) {
            // إذا كانت العملة الجديدة هي الافتراضية، قم بإلغاء تعيين العملات الأخرى
            if (isset($validated['is_default']) && $validated['is_default']) {
                Currency::where('is_default', true)->update(['is_default' => false]);
            }

            $currency = Currency::create($validated);

            // تأكد من وجود عملة افتراضية واحدة على الأقل
            if (Currency::where('is_default', true)->count() === 0) {
                $firstCurrency = Currency::first();
                if ($firstCurrency) {
                    $firstCurrency->update(['is_default' => true]);
                }
            }
        });

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

        // =================================================================
        // **3. إضافة المنطق الذري والمستدام لتغيير العملة الافتراضية**
        // =================================================================
        DB::transaction(function () use ($currency, $validated) {
            // إذا كان الطلب يهدف إلى تعيين هذه العملة كافتراضية
            if (isset($validated['is_default']) && $validated['is_default']) {
                // قم بإلغاء تعيين جميع العملات الأخرى أولاً
                Currency::where('id', '!=', $currency->id)->update(['is_default' => false]);
            }

            // قم بتحديث العملة الحالية
            $currency->update($validated);

            // في حالة نادرة: إذا قام المستخدم بإلغاء تعيين العملة الافتراضية الوحيدة،
            // قم بتعيين أول عملة في النظام كافتراضية لضمان وجود عملة افتراضية دائمًا.
            if (Currency::where('is_default', true)->count() === 0) {
                $firstCurrency = Currency::first();
                if ($firstCurrency) {
                    $firstCurrency->update(['is_default' => true]);
                }
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Currency updated successfully',
            'data' => $currency->fresh(), // .fresh() لإعادة تحميل البيانات من قاعدة البيانات
        ]);
    }

    public function destroy(Currency $currency)
    {
        // =================================================================
        // **4. إضافة حماية لمنع حذف العملة الافتراضية**
        // =================================================================
        if ($currency->is_default) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete the default currency. Please set another currency as default first.',
            ], 422); // 422 Unprocessable Entity
        }

        $currency->delete();

        return response()->json([
            'success' => true,
            'message' => 'Currency deleted successfully',
        ]);
    }
}
