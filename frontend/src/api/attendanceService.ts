import { apiClient } from './apiClient';
import type { Employee } from './employeeService'; // <-- استيراد واجهة الموظف

// [تعديل] واجهة سجل الحضور
export interface Attendance {
  id: number;
  employee_id: number; // <-- تعديل: من user_id إلى employee_id
  date: string;
  check_in: string | null;
  check_out: string | null;
  work_hours: number | null;
  status: 'present' | 'absent' | 'late' | 'half_day';
  notes?: string;
  employee?: Employee; // <-- تعديل: الآن يحتوي على بيانات الموظف الكاملة (التي تحتوي بدورها على المستخدم)
  formatted_work_hours?: string;
  created_at?: string;
  updated_at?: string;
}

// [تعديل] واجهة إحصائيات الحضور
export interface AttendanceStatistics {
  present: number;
  absent: number;
  late: number;
  half_day: number;
  total_work_hours: string; // الواجهة الخلفية تعيدها كنص منسق
}

// واجهة استجابة قائمة الحضور (مع الترقيم)
export interface AttendancesResponse {
  data: Attendance[];
  current_page: number;
  last_page: number;
  total: number;
}

// واجهة استجابة سجل حضور واحد
export interface AttendanceResponse {
  success: any;
  message: string;
  data: Attendance;
}

// واجهة استجابة الإحصائيات
export interface StatisticsResponse {
  success: boolean;
  data: AttendanceStatistics;
}

export const attendanceService = {
  /**
   * [تعديل] جلب جميع سجلات الحضور
   */
  async getAll(params?: {
    employee_id?: number; // <-- تعديل: الفلترة بـ employee_id
    start_date?: string;
    end_date?: string;
    status?: string;
    per_page?: number;
    page?: number;
  }): Promise<AttendancesResponse> {
    const response = await apiClient.get('/attendances', { params });
    return response.data;
  },

  /**
   * جلب سجل حضور بالـ ID
   */
  async getById(id: number): Promise<AttendanceResponse> {
    const response = await apiClient.get(`/attendances/${id}`);
    return response.data;
  },

  /**
   * تسجيل حضور للمستخدم الحالي (لا يحتاج لإرسال ID)
   */
  async checkIn(data?: { notes?: string }): Promise<AttendanceResponse> {
    const response = await apiClient.post('/attendances/check-in', data);
    return response.data;
  },

  /**
   * تسجيل انصراف للمستخدم الحالي (لا يحتاج لإرسال ID)
   */
  async checkOut(data?: { notes?: string }): Promise<AttendanceResponse> {
    const response = await apiClient.post('/attendances/check-out', data);
    return response.data;
  },

  /**
   * [تعديل] إنشاء أو تحديث سجل حضور (للمدير)
   */
  async createOrUpdate(data: {
    employee_id: number; // <-- تعديل: employee_id مطلوب
    date: string;
    check_in?: string;
    check_out?: string;
    status: string;
    notes?: string;
  }): Promise<AttendanceResponse> {
    // Laravel تستخدم POST لـ store و PUT/PATCH لـ update، لكن بما أننا دمجناها في دالة واحدة في المتحكم
    // يمكننا استخدام POST هنا.
    const response = await apiClient.post('/attendances', data);
    return response.data;
  },

  /**
   * حذف سجل حضور
   */
  async delete(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/attendances/${id}`);
    return response.data;
  },

  /**
   * [تعديل] جلب إحصائيات الموظف
   */
  async getStatistics(
    employeeId: number, // <-- تعديل: الآن يستقبل employeeId
    startDate: string,
    endDate: string
  ): Promise<StatisticsResponse> {
    const response = await apiClient.get(`/attendances/statistics/${employeeId}`, {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },
};
