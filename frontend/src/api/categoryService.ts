import { apiClient } from './apiClient';
import { CATEGORIES_ENDPOINTS, BRANDS_ENDPOINTS, UNITS_ENDPOINTS, CURRENCIES_ENDPOINTS, SALES_INVOICES_ENDPOINTS, PURCHASE_INVOICES_ENDPOINTS, SUPPLIERS_ENDPOINTS, DEBTS_ENDPOINTS, EXPENSES_ENDPOINTS, USERS_ENDPOINTS, ROLES_ENDPOINTS, REPORTS_ENDPOINTS } from './endpoints';

export interface Category {
  id: number;
  name: string;
  name_ar: string;
  description?: string;
  image?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryData {
  name: string;
  name_ar: string;
  description?: string;
  image?: string;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {}

export const categoryService = {
  // Get all categories
  getCategories: async () => {
    const response = await apiClient.get(CATEGORIES_ENDPOINTS.LIST);
    return response.data;
  },

  // Get category by ID
  getCategory: async (id: number) => {
    const response = await apiClient.get(CATEGORIES_ENDPOINTS.SHOW(id));
    return response.data;
  },

  // Create new category
  createCategory: async (data: CreateCategoryData) => {
    const response = await apiClient.post(CATEGORIES_ENDPOINTS.CREATE, data);
    return response.data;
  },

  // Update category
  updateCategory: async (id: number, data: UpdateCategoryData) => {
    const response = await apiClient.put(CATEGORIES_ENDPOINTS.UPDATE(id), data);
    return response.data;
  },

  // Delete category
  deleteCategory: async (id: number) => {
    const response = await apiClient.delete(CATEGORIES_ENDPOINTS.DELETE(id));
    return response.data;
  },
};
