import apiClient from './apiClient';
import { BRANDS_ENDPOINTS } from './endpoints';

export interface Brand {
  id: number;
  name: string;
  name_ar: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateBrandRequest {
  name: string;
  name_ar: string;
  description?: string;
}

export interface UpdateBrandRequest extends CreateBrandRequest {}

export const brandService = {
  // Get all brands
  getAll: async (params?: any) => {
    const response = await apiClient.get(BRANDS_ENDPOINTS.LIST, { params });
    return response.data;
  },

  // Get single brand
  getById: async (id: number) => {
    const response = await apiClient.get(BRANDS_ENDPOINTS.GET(id));
    return response.data;
  },

  // Create brand
  create: async (data: CreateBrandRequest) => {
    const response = await apiClient.post(BRANDS_ENDPOINTS.CREATE, data);
    return response.data;
  },

  // Update brand
  update: async (id: number, data: UpdateBrandRequest) => {
    const response = await apiClient.put(BRANDS_ENDPOINTS.UPDATE(id), data);
    return response.data;
  },

  // Delete brand
  delete: async (id: number) => {
    const response = await apiClient.delete(BRANDS_ENDPOINTS.DELETE(id));
    return response.data;
  },
};
