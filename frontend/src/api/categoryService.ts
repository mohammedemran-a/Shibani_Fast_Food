import apiClient from './apiClient';
import { CATEGORIES_ENDPOINTS } from './endpoints';

export interface Category {
  id: number;
  name: string;
  name_ar: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCategoryRequest {
  name: string;
  name_ar: string;
  description?: string;
}

export interface UpdateCategoryRequest extends CreateCategoryRequest {}

export const categoryService = {
  // Get all categories
  getAll: async (params?: any) => {
    const response = await apiClient.get(CATEGORIES_ENDPOINTS.LIST, { params });
    return response.data;
  },

  // Get single category
  getById: async (id: number) => {
    const response = await apiClient.get(CATEGORIES_ENDPOINTS.GET(id));
    return response.data;
  },

  // Create category
  create: async (data: CreateCategoryRequest) => {
    const response = await apiClient.post(CATEGORIES_ENDPOINTS.CREATE, data);
    return response.data;
  },

  // Update category
  update: async (id: number, data: UpdateCategoryRequest) => {
    const response = await apiClient.put(CATEGORIES_ENDPOINTS.UPDATE(id), data);
    return response.data;
  },

  // Delete category
  delete: async (id: number) => {
    const response = await apiClient.delete(CATEGORIES_ENDPOINTS.DELETE(id));
    return response.data;
  },
};
