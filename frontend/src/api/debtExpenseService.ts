// frontend/src/api/debtExpenseService.ts

import { apiClient } from './apiClient';

// ====================================================================
// Interfaces (تمثل شكل البيانات القادمة من الـ API)
// ====================================================================

// واجهة لملخص ديون العملاء (لصفحة DebtManagement)
export interface CustomerDebtSummary {
  customer_id: number;
  customer_name: string;
  customer_phone: string;
  total_debt: number;
  unpaid_invoices_count: number;
  last_purchase_date: string;
}

// واجهة لتفاصيل دين العميل (لفواتير العميل)
export interface CustomerDebtDetails {
  customer: {
    id: number;
    name: string;
    phone: string;
    email?: string;
    address?: string;
  };
  invoices: Invoice[];
  payments: Payment[];
  summary: {
    total_debt: number;
    total_paid: number;
  }
}

// واجهة لبيانات الفاتورة (ضمن تفاصيل الدين)
export interface Invoice {
  id: number; // sales_invoice_id
  debt_id: number;
  invoice_number: string;
  sale_date: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
}

// واجهة لبيانات الدفعة
export interface Payment {
  id: number;
  payment_date: string;
  amount: number;
  invoice_number: string | null;
}

// واجهة لبيانات الدفع المرسلة للـ API
export interface DebtPaymentData {
  customer_id: number | string;
  debt_id?: number;
  amount: number;
  payment_date: string;
  payment_method: 'cash' | 'wallet' | 'check';
}

// واجهة لمعاملات جلب الديون
export interface GetDebtsParams {
  search?: string;
  page?: number;
  per_page?: number;
}

// ====================================================================
// Service (الدوال التي تتصل بالـ API)
// ====================================================================

export const debtExpenseService = {
  /**
   * // جلب ملخص ديون جميع العملاء
   * @param params - معاملات البحث والترقيم
   */
  getDebtsSummary: async (params?: GetDebtsParams) => {
    const response = await apiClient.get<{ data: CustomerDebtSummary[], meta: any }>('/customer-debts-summary', { params });
    return response.data;
  },

  /**
   * // جلب التفاصيل الكاملة لديون عميل محدد
   * @param customerId - معرف العميل
   */
  getCustomerDebtDetails: async (customerId: number | string) => {
    const response = await apiClient.get<CustomerDebtDetails>(`/customers/${customerId}/debts`);
    return response.data;
  },

  /**
   * // تسجيل دفعة جديدة لدين
   * @param data - بيانات الدفعة
   */
  payDebt: async (data: DebtPaymentData) => {
    const response = await apiClient.post('/debts/pay', data);
    return response.data;
  },
};
