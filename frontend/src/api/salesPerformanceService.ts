import { apiClient } from './apiClient';

export interface SalesPerformance {
  user_id: number;
  user_name: string;
  user_email: string;
  user_avatar?: string;
  role_name?: string;
  total_sales: number;
  total_profit: number;
  total_invoices: number;
  average_invoice_value: number;
  daily_average: number;
  profit_margin: number;
  period: {
    start_date: string;
    end_date: string;
    days: number;
  };
}

export interface UserPerformanceDetail extends SalesPerformance {
  invoices?: {
    data: Array<{
      id: number;
      invoice_number: string;
      invoice_date: string;
      total_amount: number;
      profit: number;
      customer?: {
        id: number;
        name: string;
      };
    }>;
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface TopPerformer {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  total_invoices: number;
  total_sales: number;
  total_profit: number;
}

export interface PerformanceResponse {
  success: boolean;
  message?: string;
  data: SalesPerformance[];
}

export interface UserPerformanceResponse {
  success: boolean;
  message?: string;
  data: UserPerformanceDetail;
}

export interface TopPerformersResponse {
  success: boolean;
  message?: string;
  data: TopPerformer[];
}

export const salesPerformanceService = {
  /**
   * Get all users performance
   */
  async getAll(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<PerformanceResponse> {
    const response = await apiClient.get('/sales-performance', { params });
    return response.data;
  },

  /**
   * Get user performance
   */
  async getByUser(
    userId: number,
    params?: {
      start_date?: string;
      end_date?: string;
      per_page?: number;
      page?: number;
    }
  ): Promise<UserPerformanceResponse> {
    const response = await apiClient.get(`/sales-performance/${userId}`, { params });
    return response.data;
  },

  /**
   * Get top performers
   */
  async getTopPerformers(params?: {
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): Promise<TopPerformersResponse> {
    const response = await apiClient.get('/sales-performance/top-performers/list', { params });
    return response.data;
  },

  /**
   * Compare users performance
   */
  async compareUsers(
    userIds: number[],
    params?: {
      start_date?: string;
      end_date?: string;
    }
  ): Promise<PerformanceResponse> {
    const response = await apiClient.post('/sales-performance/compare', {
      user_ids: userIds,
      ...params,
    });
    return response.data;
  },
};
