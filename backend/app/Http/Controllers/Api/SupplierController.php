<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;

/**
 * متحكم الموردين
 * 
 * يدير جميع العمليات المتعلقة بالموردين (CRUD)
 * مع دعم البحث والفلترة والترقيم
 */
class SupplierController extends Controller
{
    /**
     * عرض قائمة الموردين
     * 
     * يدعم:
     * - البحث بالاسم أو رقم الهاتف
     * - الفلترة حسب حالة التفعيل
     * - الترقيم الديناميكي
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // استعلام أساسي
        $query = Supplier::query();

        // البحث في الاسم أو رقم الهاتف
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('phone', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%");
            });
        }

        // الفلترة حسب حالة التفعيل
        if ($request->has('is_active')) {
            $isActive = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN);
            $query->where('is_active', $isActive);
        }

        // عرض جميع الموردين بدون ترقيم إذا طُلب ذلك
        if ($request->has('all') && $request->all == 'true') {
            $suppliers = $query->orderBy('name')->get();
            return response()->json([
                'success' => true,
                'data' => ['data' => $suppliers, 'total' => $suppliers->count()],
            ]);
        }

        // الترقيم الديناميكي
        $suppliers = $query->orderBy('name')->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $suppliers,
        ]);
    }

    /**
     * إنشاء مورد جديد
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // التحقق من صحة البيانات
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'required|string|max:20',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        // تفعيل المورد افتراضياً
        if (!isset($validated['is_active'])) {
            $validated['is_active'] = true;
        }

        // إنشاء المورد
        $supplier = Supplier::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء المورد بنجاح',
            'data' => $supplier,
        ], 201);
    }

    /**
     * عرض مورد محدد
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $supplier = Supplier::with('purchaseInvoices')->find($id);

        if (!$supplier) {
            return response()->json([
                'success' => false,
                'message' => 'المورد غير موجود',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $supplier,
        ]);
    }

    /**
     * تحديث مورد
     * 
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $supplier = Supplier::find($id);

        if (!$supplier) {
            return response()->json([
                'success' => false,
                'message' => 'المورد غير موجود',
            ], 404);
        }

        // التحقق من صحة البيانات
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'sometimes|required|string|max:20',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        // تحديث المورد
        $supplier->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث المورد بنجاح',
            'data' => $supplier,
        ]);
    }

    /**
     * حذف مورد
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $supplier = Supplier::find($id);

        if (!$supplier) {
            return response()->json([
                'success' => false,
                'message' => 'المورد غير موجود',
            ], 404);
        }

        // التحقق من عدم وجود فواتير مرتبطة
        if ($supplier->purchaseInvoices()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن حذف المورد لوجود فواتير شراء مرتبطة به',
            ], 422);
        }

        $supplier->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف المورد بنجاح',
        ]);
    }

    /**
     * تفعيل/تعطيل مورد
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function toggleActive($id)
    {
        $supplier = Supplier::find($id);

        if (!$supplier) {
            return response()->json([
                'success' => false,
                'message' => 'المورد غير موجود',
            ], 404);
        }

        $supplier->is_active = !$supplier->is_active;
        $supplier->save();

        return response()->json([
            'success' => true,
            'message' => $supplier->is_active ? 'تم تفعيل المورد' : 'تم تعطيل المورد',
            'data' => $supplier,
        ]);
    }
}
