<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log; // <-- إضافة: لتسجيل الأخطاء
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class EmployeeController extends Controller
{
    /**
     * عرض قائمة بجميع الموظفين مع بيانات المستخدم والدور.
     */
    public function index(Request $request)
    {
        $employees = Employee::with(['user.role' => function ($query) {
            $query->select('id', 'name');
        }])
        ->when($request->search, function ($query, $search) {
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        })
        ->latest()
        ->paginate($request->per_page ?? 15);

        return response()->json($employees);
    }

    /**
     * إنشاء سجل موظف جديد وربطه بمستخدم موجود.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id|unique:employees,user_id',
            'job_title' => 'required|string|max:255',
            'department' => 'nullable|string|max:255',
            'salary_type' => 'required|in:monthly,hourly',
            'salary' => 'required_if:salary_type,monthly|nullable|numeric|min:0',
            'hourly_rate' => 'required_if:salary_type,hourly|nullable|numeric|min:0',
            'hire_date' => 'nullable|date',
        ], [
            'user_id.required' => 'يجب اختيار مستخدم لربطه بالموظف.',
            'user_id.unique' => 'هذا المستخدم لديه سجل موظف بالفعل.',
            'job_title.required' => 'المسمى الوظيفي مطلوب.',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $employee = Employee::create($validator->validated());
        $employee->load('user.role');

        return response()->json([
            'message' => 'تم إنشاء سجل الموظف بنجاح.',
            'data' => $employee,
        ], 201);
    }

    /**
     * عرض بيانات موظف محدد.
     */
    public function show(Employee $employee)
    {
        $employee->load('user.role');
        return response()->json($employee);
    }

    /**
     * تحديث بيانات الموظف.
     */
    public function update(Request $request, Employee $employee)
    {
        $validator = Validator::make($request->all(), [
            'job_title' => 'sometimes|required|string|max:255',
            'department' => 'nullable|string|max:255',
            'salary_type' => 'sometimes|required|in:monthly,hourly',
            'hire_date' => 'nullable|date',
            'salary' => [
                'nullable', 'numeric', 'min:0',
                Rule::requiredIf(fn () => $request->input('salary_type') === 'monthly'),
            ],
            'hourly_rate' => [
                'nullable', 'numeric', 'min:0',
                Rule::requiredIf(fn () => $request->input('salary_type') === 'hourly'),
            ],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // ========= التعديل هنا =========
            $employee->job_title = $request->input('job_title', $employee->job_title);
            $employee->department = $request->input('department', $employee->department);
            $employee->hire_date = $request->input('hire_date', $employee->hire_date);

            if ($request->has('salary_type')) {
                $employee->salary_type = $request->input('salary_type');
                
                if ($request->input('salary_type') === 'monthly') {
                    $employee->salary = $request->input('salary', 0);
                    $employee->hourly_rate = 0; // تعيين الحقل الآخر إلى 0
                } elseif ($request->input('salary_type') === 'hourly') {
                    $employee->hourly_rate = $request->input('hourly_rate', 0);
                    $employee->salary = 0; // تعيين الحقل الآخر إلى 0
                }
            } else {
                if ($employee->salary_type === 'monthly' && $request->has('salary')) {
                    $employee->salary = $request->input('salary');
                }
                if ($employee->salary_type === 'hourly' && $request->has('hourly_rate')) {
                    $employee->hourly_rate = $request->input('hourly_rate');
                }
            }

            $employee->save();
            // ========= نهاية التعديل =========

        } catch (\Exception $e) {
            Log::error('Employee Update Failed: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json(['message' => 'حدث خطأ فادح أثناء تحديث بيانات الموظف.'], 500);
        }
        
        $employee->load('user.role');

        return response()->json([
            'message' => 'تم تحديث بيانات الموظف بنجاح.',
            'data' => $employee,
        ]);
    }

    /**
     * حذف سجل الموظف (دون حذف المستخدم).
     */
    public function destroy(Employee $employee)
    {
        $employee->delete();
        return response()->json(['message' => 'تم حذف سجل الموظف بنجاح.'], 200);
    }

    /**
     * جلب قائمة المستخدمين الذين ليس لديهم سجل موظف بعد.
     */
    public function getUnlinkedUsers()
    {
        $users = User::whereDoesntHave('employee')->get(['id', 'name', 'email']);
        return response()->json($users);
    }
}
