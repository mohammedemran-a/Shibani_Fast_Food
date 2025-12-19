import apiClient from './apiClient';
import { SALES_INVOICES_ENDPOINTS } from './endpoints';

export interface SalesInvoiceItem {
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal?: number;
}

export interface SalesInvoice {
  id: number;
  invoice_number: string;
  customer_id: number | null;
  cashier_id: number;
  invoice_date: string;
  items: SalesInvoiceItem[];
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  payment_method: 'cash' | 'wallet' | 'debt';
  wallet_name?: string | null;
  transaction_code?: string | null;
  notes?: string | null;
  is_cancelled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSalesInvoiceRequest {
  customer_id?: number | null;
  invoice_date: string;
  items: SalesInvoiceItem[];
  payment_method: 'cash' | 'wallet' | 'debt';
  wallet_name?: string | null;
  transaction_code?: string | null;
  discount_amount?: number;
  tax_amount?: number;
  notes?: string | null;
}

export interface SalesInvoiceResponse {
  success: boolean;
  message?: string;
  data: SalesInvoice;
}

export interface SalesInvoicesResponse {
  success: boolean;
  data: {
    data: SalesInvoice[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface SalesSummary {
  success: boolean;
  data: {
    total_sales: number;
    total_items: number;
    average_transaction: number;
    transactions_count: number;
    period: string;
  };
}

class SalesService {
  /**
   * Get all sales invoices
   */
  async getSalesInvoices(params?: {
    search?: string;
    per_page?: number;
    page?: number;
    from_date?: string;
    to_date?: string;
  }): Promise<SalesInvoicesResponse> {
    try {
      const response = await apiClient.get<SalesInvoicesResponse>(
        SALES_INVOICES_ENDPOINTS.LIST,
        { params }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get single sales invoice
   */
  async getSalesInvoice(id: number): Promise<SalesInvoiceResponse> {
    try {
      const response = await apiClient.get<SalesInvoiceResponse>(
        SALES_INVOICES_ENDPOINTS.GET(id)
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create new sales invoice
   */
  async createSalesInvoice(
    data: CreateSalesInvoiceRequest
  ): Promise<SalesInvoiceResponse> {
    try {
      const response = await apiClient.post<SalesInvoiceResponse>(
        SALES_INVOICES_ENDPOINTS.CREATE,
        data
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cancel sales invoice
   */
  async cancelSalesInvoice(id: number): Promise<SalesInvoiceResponse> {
    try {
      const response = await apiClient.post<SalesInvoiceResponse>(
        SALES_INVOICES_ENDPOINTS.CANCEL(id)
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get daily sales summary
   */
  async getDailySummary(date?: string): Promise<SalesSummary> {
    try {
      const response = await apiClient.get<SalesSummary>(
        SALES_INVOICES_ENDPOINTS.DAILY_SUMMARY,
        { params: { date } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get weekly sales summary
   */
  async getWeeklySummary(week?: string): Promise<SalesSummary> {
    try {
      const response = await apiClient.get<SalesSummary>(
        SALES_INVOICES_ENDPOINTS.WEEKLY_SUMMARY,
        { params: { week } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get monthly sales summary
   */
  async getMonthlySummary(month?: string): Promise<SalesSummary> {
    try {
      const response = await apiClient.get<SalesSummary>(
        SALES_INVOICES_ENDPOINTS.MONTHLY_SUMMARY,
        { params: { month } }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Calculate invoice total
   */
  calculateTotal(
    items: SalesInvoiceItem[],
    discountAmount: number = 0,
    taxAmount: number = 0
  ): number {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    return subtotal - discountAmount + taxAmount;
  }
}

export default new SalesService();
