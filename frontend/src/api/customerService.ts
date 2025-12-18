import { apiClient } from './apiClient';
import { CUSTOMERS_ENDPOINTS } from './endpoints';

export interface Customer {
  id: number;
  name: string;
  name_ar: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  notes?: string;
  loyalty_points: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerData {
  name: string;
  name_ar: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  notes?: string;
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {
  is_active?: boolean;
}

export interface GetCustomersParams {
  search?: string;
  page?: number;
  per_page?: number;
}

const customerService = {
  // Get all customers
  getCustomers: async (params?: GetCustomersParams) => {
    const response = await apiClient.get(CUSTOMERS_ENDPOINTS.LIST, { params });
    return response.data;
  },

  // Get customer by ID
  getCustomer: async (id: number) => {
    const response = await apiClient.get(CUSTOMERS_ENDPOINTS.GET(id));
    return response.data;
  },

  // Create new customer
  createCustomer: async (data: CreateCustomerData) => {
    const response = await apiClient.post(CUSTOMERS_ENDPOINTS.CREATE, data);
    return response.data;
  },

  // Update customer
  updateCustomer: async (id: number, data: UpdateCustomerData) => {
    const response = await apiClient.put(CUSTOMERS_ENDPOINTS.UPDATE(id), data);
    return response.data;
  },

  // Delete customer
  deleteCustomer: async (id: number) => {
    const response = await apiClient.delete(CUSTOMERS_ENDPOINTS.DELETE(id));
    return response.data;
  },
};

export default customerService;
