import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './endpoints';

export interface DashboardStats {
  total_sales: number;
  total_purchases: number;
  total_profit: number;
  total_expenses: number;
  low_stock_count: number;
  pending_debts: number;
}

export interface ProfitReportParams {
  from_date?: string;
  to_date?: string;
  product_id?: number;
  category_id?: number;
}

export interface SalesReportParams {
  from_date?: string;
  to_date?: string;
  customer_id?: number;
  cashier_id?: number;
}

export interface PurchasesReportParams {
  from_date?: string;
  to_date?: string;
  supplier_id?: number;
}

export const reportService = {
  // Dashboard statistics
  getDashboardStats: async () => {
    const response = await apiClient.get(API_ENDPOINTS.REPORTS.DASHBOARD);
    return response.data;
  },

  // Profit report
  getProfitReport: async (params?: ProfitReportParams) => {
    const response = await apiClient.get(API_ENDPOINTS.REPORTS.PROFIT, { params });
    return response.data;
  },

  // Sales report
  getSalesReport: async (params?: SalesReportParams) => {
    const response = await apiClient.get(API_ENDPOINTS.REPORTS.SALES, { params });
    return response.data;
  },

  // Purchases report
  getPurchasesReport: async (params?: PurchasesReportParams) => {
    const response = await apiClient.get(API_ENDPOINTS.REPORTS.PURCHASES, { params });
    return response.data;
  },

  // Daily sales summary
  getDailySummary: async (date: string) => {
    const response = await apiClient.get(API_ENDPOINTS.REPORTS.DAILY_SUMMARY, {
      params: { date },
    });
    return response.data;
  },

  // Monthly sales summary
  getMonthlySummary: async (month: string) => {
    const response = await apiClient.get(API_ENDPOINTS.REPORTS.MONTHLY_SUMMARY, {
      params: { month },
    });
    return response.data;
  },
};
