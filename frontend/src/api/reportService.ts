import { apiClient } from './apiClient';
import { CATEGORIES_ENDPOINTS, BRANDS_ENDPOINTS, UNITS_ENDPOINTS, CURRENCIES_ENDPOINTS, SALES_INVOICES_ENDPOINTS, PURCHASE_INVOICES_ENDPOINTS, SUPPLIERS_ENDPOINTS, DEBTS_ENDPOINTS, EXPENSES_ENDPOINTS, USERS_ENDPOINTS, ROLES_ENDPOINTS, REPORTS_ENDPOINTS } from './endpoints';

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
    const response = await apiClient.get(REPORTS_ENDPOINTS.DASHBOARD);
    return response.data;
  },

  // Profit report
  getProfitReport: async (params?: ProfitReportParams) => {
    const response = await apiClient.get(REPORTS_ENDPOINTS.PROFIT, { params });
    return response.data;
  },

  // Sales report
  getSalesReport: async (params?: SalesReportParams) => {
    const response = await apiClient.get(REPORTS_ENDPOINTS.SALES, { params });
    return response.data;
  },

  // Purchases report
  getPurchasesReport: async (params?: PurchasesReportParams) => {
    const response = await apiClient.get(REPORTS_ENDPOINTS.PURCHASES, { params });
    return response.data;
  },

  // Daily sales summary
  getDailySummary: async (date: string) => {
    const response = await apiClient.get(REPORTS_ENDPOINTS.DAILY_SUMMARY, {
      params: { date },
    });
    return response.data;
  },

  // Monthly sales summary
  getMonthlySummary: async (month: string) => {
    const response = await apiClient.get(REPORTS_ENDPOINTS.MONTHLY_SUMMARY, {
      params: { month },
    });
    return response.data;
  },
};
