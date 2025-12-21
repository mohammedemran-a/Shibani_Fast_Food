import { apiClient } from './apiClient';

export interface Attendance {
  id: number;
  user_id: number;
  date: string;
  check_in: string | null;
  check_out: string | null;
  work_hours: number | null;
  status: 'present' | 'absent' | 'late' | 'half_day';
  notes?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  formatted_work_hours?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AttendanceStatistics {
  total_days: number;
  present_days: number;
  absent_days: number;
  late_days: number;
  half_days: number;
  total_work_hours: number;
  average_work_hours: number;
}

export interface AttendancesResponse {
  success: boolean;
  message?: string;
  data: {
    data: Attendance[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface AttendanceResponse {
  success: boolean;
  message?: string;
  data: Attendance;
}

export interface StatisticsResponse {
  success: boolean;
  message?: string;
  data: AttendanceStatistics;
}

export const attendanceService = {
  /**
   * Get all attendances
   */
  async getAll(params?: {
    user_id?: number;
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
   * Get attendance by ID
   */
  async getById(id: number): Promise<AttendanceResponse> {
    const response = await apiClient.get(`/attendances/${id}`);
    return response.data;
  },

  /**
   * Check in
   */
  async checkIn(data?: {
    user_id?: number;
    status?: string;
    notes?: string;
  }): Promise<AttendanceResponse> {
    const response = await apiClient.post('/attendances/check-in', data);
    return response.data;
  },

  /**
   * Check out
   */
  async checkOut(data?: {
    user_id?: number;
    notes?: string;
  }): Promise<AttendanceResponse> {
    const response = await apiClient.post('/attendances/check-out', data);
    return response.data;
  },

  /**
   * Create or update attendance
   */
  async createOrUpdate(data: {
    user_id: number;
    date: string;
    check_in?: string;
    check_out?: string;
    status: string;
    notes?: string;
  }): Promise<AttendanceResponse> {
    const response = await apiClient.post('/attendances', data);
    return response.data;
  },

  /**
   * Delete attendance
   */
  async delete(id: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/attendances/${id}`);
    return response.data;
  },

  /**
   * Get user statistics
   */
  async getStatistics(
    userId: number,
    startDate: string,
    endDate: string
  ): Promise<StatisticsResponse> {
    const response = await apiClient.get(`/attendances/statistics/${userId}`, {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },
};
