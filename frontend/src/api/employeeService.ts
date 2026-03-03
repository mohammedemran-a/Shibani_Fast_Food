import { apiClient } from './apiClient';
import type { User } from './userService';

// واجهة بيانات الموظف كما هي في الواجهة الخلفية
export interface Employee {
  id: number;
  user_id: number;
  job_title: string;
  department?: string;
  salary_type: 'monthly' | 'hourly';
  salary: number | null; // <-- تعديل: يمكن أن يكون null
  hourly_rate?: number | null; // <-- تعديل: يمكن أن يكون null
  hire_date?: string;
  user: User; // بيانات المستخدم المرتبطة
}

// واجهة بيانات إنشاء الموظف
export interface CreateEmployeeData {
  user_id: number;
  job_title: string;
  department?: string;
  salary_type: 'monthly' | 'hourly';
  salary?: number; // <-- تعديل: اختياري
  hourly_rate?: number; // <-- تعديل: اختياري
  hire_date?: string;
}

// ========= التعديل هنا =========
// تم تغيير interface إلى type لتجنب خطأ ESLint
export type UpdateEmployeeData = Partial<Omit<CreateEmployeeData, 'user_id'>>;
// ========= نهاية التعديل =========

// واجهة استجابة قائمة الموظفين (مع الترقيم)
export interface EmployeesResponse {
  data: Employee[];
  current_page: number;
  last_page: number;
  total: number;
}

// واجهة استجابة موظف واحد
export interface EmployeeResponse {
  message: string;
  data: Employee;
}

export const employeeService = {
  /**
   * جلب قائمة الموظفين مع الترقيم والبحث
   */
  async getAll(params?: { search?: string; page?: number }): Promise<EmployeesResponse> {
    const response = await apiClient.get('/employees', { params });
    return response.data;
  },

  /**
   * جلب قائمة المستخدمين الذين ليس لديهم سجل موظف
   */
  async getUnlinkedUsers(): Promise<User[]> {
    const response = await apiClient.get('/unlinked-users');
    return response.data;
  },

  /**
   * إنشاء سجل موظف جديد
   */
  async create(data: CreateEmployeeData): Promise<EmployeeResponse> {
    const response = await apiClient.post('/employees', data);
    return response.data;
  },

  /**
   * تحديث بيانات سجل موظف
   */
  async update(id: number, data: UpdateEmployeeData): Promise<EmployeeResponse> {
    const response = await apiClient.put(`/employees/${id}`, data);
    return response.data;
  },

  /**
   * حذف سجل موظف
   */
  async delete(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/employees/${id}`);
    return response.data;
  },
};
