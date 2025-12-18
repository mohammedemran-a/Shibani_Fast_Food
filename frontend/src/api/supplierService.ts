import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './endpoints';

export interface Supplier {
  id: number;
  name: string;
  name_ar: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSupplierData {
  name: string;
  name_ar: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  notes?: string;
}

export interface UpdateSupplierData extends Partial<CreateSupplierData> {
  is_active?: boolean;
}

export interface GetSuppliersParams {
  search?: string;
  page?: number;
  per_page?: number;
}

export const supplierService = {
  // Get all suppliers
  getSuppliers: async (params?: GetSuppliersParams) => {
    const response = await apiClient.get(API_ENDPOINTS.SUPPLIERS.LIST, { params });
    return response.data;
  },

  // Get supplier by ID
  getSupplier: async (id: number) => {
    const response = await apiClient.get(API_ENDPOINTS.SUPPLIERS.SHOW(id));
    return response.data;
  },

  // Create new supplier
  createSupplier: async (data: CreateSupplierData) => {
    const response = await apiClient.post(API_ENDPOINTS.SUPPLIERS.CREATE, data);
    return response.data;
  },

  // Update supplier
  updateSupplier: async (id: number, data: UpdateSupplierData) => {
    const response = await apiClient.put(API_ENDPOINTS.SUPPLIERS.UPDATE(id), data);
    return response.data;
  },

  // Delete supplier
  deleteSupplier: async (id: number) => {
    const response = await apiClient.delete(API_ENDPOINTS.SUPPLIERS.DELETE(id));
    return response.data;
  },
};
