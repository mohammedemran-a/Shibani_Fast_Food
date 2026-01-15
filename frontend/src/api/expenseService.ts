import { apiClient } from './apiClient';

export interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
  user_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateExpenseData {
  description: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
}

export interface UpdateExpenseData {
  description?: string;
  amount?: number;
  category?: string;
  date?: string;
  notes?: string;
}

export interface ExpensesResponse {
  success: boolean;
  message?: string;
  data: {
    data: Expense[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ExpenseResponse {
  success: boolean;
  message?: string;
  data: Expense;
}

export interface ExpenseSummary {
  total_expenses: number;
  total_by_category: Record<string, number>;
  monthly_total: number;
  average_expense: number;
}

export const expenseService = {
  /**
   * Get all expenses with pagination and filtering
   */
  async getAll(params?: {
    category?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    per_page?: number;
    page?: number;
  }): Promise<ExpensesResponse> {
    console.log('Fetching expenses with params:', params);
    try {
      const response = await apiClient.get('/expenses', { params });
      console.log('Expenses fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch expenses:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get expense by ID
   */
  async getById(id: number): Promise<ExpenseResponse> {
    console.log('Fetching expense by ID:', id);
    try {
      const response = await apiClient.get(`/expenses/${id}`);
      console.log('Expense fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch expense:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Create new expense
   */
  async create(data: CreateExpenseData): Promise<ExpenseResponse> {
    console.log('Creating new expense with data:', data);
    try {
      const response = await apiClient.post('/expenses', data);
      console.log('Expense created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to create expense:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  /**
   * Update expense
   */
  async update(id: number, data: UpdateExpenseData): Promise<ExpenseResponse> {
    console.log('Updating expense:', id, 'with data:', data);
    try {
      const response = await apiClient.put(`/expenses/${id}`, data);
      console.log('Expense updated successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to update expense:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Delete expense
   */
  async delete(id: number): Promise<{ success: boolean; message: string }> {
    console.log('Deleting expense:', id);
    try {
      const response = await apiClient.delete(`/expenses/${id}`);
      console.log('Expense deleted successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to delete expense:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get expense summary and statistics
   */
  async getSummary(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<{ success: boolean; data: ExpenseSummary }> {
    console.log('Fetching expense summary with params:', params);
    try {
      const response = await apiClient.get('/expenses/summary', { params });
      console.log('Expense summary fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch expense summary:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get expenses by category
   */
  async getByCategory(category: string, params?: {
    start_date?: string;
    end_date?: string;
    per_page?: number;
    page?: number;
  }): Promise<ExpensesResponse> {
    console.log('Fetching expenses by category:', category);
    try {
      const response = await apiClient.get(`/expenses/category/${category}`, { params });
      console.log('Expenses by category fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch expenses by category:', error.response?.data || error.message);
      throw error;
    }
  },
};
