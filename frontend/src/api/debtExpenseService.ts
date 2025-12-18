import { apiClient } from './apiClient';
import { CATEGORIES_ENDPOINTS, BRANDS_ENDPOINTS, UNITS_ENDPOINTS, CURRENCIES_ENDPOINTS, SALES_INVOICES_ENDPOINTS, PURCHASE_INVOICES_ENDPOINTS, SUPPLIERS_ENDPOINTS, DEBTS_ENDPOINTS, EXPENSES_ENDPOINTS, USERS_ENDPOINTS, ROLES_ENDPOINTS, REPORTS_ENDPOINTS } from './endpoints';

// Debts
export interface Debt {
  id: number;
  customer_id: number;
  sales_invoice_id: number;
  amount: number;
  paid_amount: number;
  status: 'pending' | 'partial' | 'paid';
  due_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DebtPayment {
  debt_id: number;
  amount: number;
  payment_date: string;
  payment_method: 'cash' | 'wallet' | 'check';
  transaction_code?: string;
  notes?: string;
}

export interface GetDebtsParams {
  customer_id?: number;
  status?: string;
  page?: number;
  per_page?: number;
}

// Expenses
export interface Expense {
  id: number;
  description: string;
  description_ar: string;
  amount: number;
  expense_date: string;
  cashier_id: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateExpenseData {
  description: string;
  description_ar: string;
  amount: number;
  expense_date: string;
  notes?: string;
}

export interface GetExpensesParams {
  from_date?: string;
  to_date?: string;
  page?: number;
  per_page?: number;
}

export const debtExpenseService = {
  // Debts
  getDebts: async (params?: GetDebtsParams) => {
    const response = await apiClient.get(DEBTS_ENDPOINTS.LIST, { params });
    return response.data;
  },

  getDebt: async (id: number) => {
    const response = await apiClient.get(DEBTS_ENDPOINTS.SHOW(id));
    return response.data;
  },

  getCustomerDebts: async (customerId: number) => {
    const response = await apiClient.get(DEBTS_ENDPOINTS.CUSTOMER(customerId));
    return response.data;
  },

  payDebt: async (data: DebtPayment) => {
    const response = await apiClient.post(DEBTS_ENDPOINTS.PAY, data);
    return response.data;
  },

  // Expenses
  getExpenses: async (params?: GetExpensesParams) => {
    const response = await apiClient.get(EXPENSES_ENDPOINTS.LIST, { params });
    return response.data;
  },

  getExpense: async (id: number) => {
    const response = await apiClient.get(EXPENSES_ENDPOINTS.SHOW(id));
    return response.data;
  },

  createExpense: async (data: CreateExpenseData) => {
    const response = await apiClient.post(EXPENSES_ENDPOINTS.CREATE, data);
    return response.data;
  },

  updateExpense: async (id: number, data: Partial<CreateExpenseData>) => {
    const response = await apiClient.put(EXPENSES_ENDPOINTS.UPDATE(id), data);
    return response.data;
  },

  deleteExpense: async (id: number) => {
    const response = await apiClient.delete(EXPENSES_ENDPOINTS.DELETE(id));
    return response.data;
  },
};
