import { apiClient } from './apiClient';
import { CATEGORIES_ENDPOINTS, BRANDS_ENDPOINTS, UNITS_ENDPOINTS, CURRENCIES_ENDPOINTS, SALES_INVOICES_ENDPOINTS, PURCHASE_INVOICES_ENDPOINTS, SUPPLIERS_ENDPOINTS, DEBTS_ENDPOINTS, EXPENSES_ENDPOINTS, USERS_ENDPOINTS, ROLES_ENDPOINTS, REPORTS_ENDPOINTS } from './endpoints';

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
    const response = await apiClient.get(SUPPLIERS_ENDPOINTS.LIST, { params });
    return response.data;
  },

  // Get supplier by ID
  getSupplier: async (id: number) => {
    const response = await apiClient.get(SUPPLIERS_ENDPOINTS.SHOW(id));
    return response.data;
  },

  // Create new supplier
  createSupplier: async (data: CreateSupplierData) => {
    const response = await apiClient.post(SUPPLIERS_ENDPOINTS.CREATE, data);
    return response.data;
  },

  // Update supplier
  updateSupplier: async (id: number, data: UpdateSupplierData) => {
    const response = await apiClient.put(SUPPLIERS_ENDPOINTS.UPDATE(id), data);
    return response.data;
  },

  // Delete supplier
  deleteSupplier: async (id: number) => {
    const response = await apiClient.delete(SUPPLIERS_ENDPOINTS.DELETE(id));
    return response.data;
  },
};
