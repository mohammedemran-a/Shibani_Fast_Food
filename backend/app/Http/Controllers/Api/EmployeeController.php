<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class EmployeeController extends Controller
{
    /**
     * عرض قائمة بجميع الموظفين مع بيانات المستخدم المرتبطة بهم.
     */
    public function index(Request $request)
    {
        // استخدام Eager Loading (with) لجلب بيانات المستخدم مع الموظف بكفاءة
        $employees = Employee::with('user:id,name,email,phone,is_active,role_id')
            ->when($request->search, function ($query, $search) {
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->paginate($request->per_page ?? 15);

        return response()->json($employees);
    }

    /**
     * عرض بيانات موظف محدد.
     */
    public function show(Employee $employee)
    {
        // تحميل بيانات المستخدم المرتبطة
        $employee->load('user:id,name,email,phone,is_active,role_id');
        return response()->json($employee);
    }

    /**
     * تحديث بيانات الموظف.
     * ملاحظة: عملية إنشاء الموظف تتم مع إنشاء المستخدم.
     */
    public function update(Request $request, Employee $employee)
    {
        $validator = Validator::make($request->all(), [
            'job_title' => 'sometimes|required|string|max:255',
            'department' => 'sometimes|nullable|string|max:255',
            'salary_type' => 'sometimes|required|in:monthly,hourly',
            'salary' => 'sometimes|required|numeric|min:0',
            'hourly_rate' => 'nullable|numeric|min:0',
            'hire_date' => 'sometimes|nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $employee->update($validator->validated());

        $employee->load('user'); // إعادة تحميل بيانات المستخدم بعد التحديث

        return response()->json([
            'message' => 'تم تحديث بيانات الموظف بنجاح.',
            'employee' => $employee,
        ]);
    }
}
