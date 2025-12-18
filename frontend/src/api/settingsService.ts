import { apiClient } from './apiClient';
import { CATEGORIES_ENDPOINTS, BRANDS_ENDPOINTS, UNITS_ENDPOINTS, CURRENCIES_ENDPOINTS, SALES_INVOICES_ENDPOINTS, PURCHASE_INVOICES_ENDPOINTS, SUPPLIERS_ENDPOINTS, DEBTS_ENDPOINTS, EXPENSES_ENDPOINTS, USERS_ENDPOINTS, ROLES_ENDPOINTS, REPORTS_ENDPOINTS } from './endpoints';

// Brands
export interface Brand {
  id: number;
  name: string;
  name_ar: string;
  description?: string;
  logo?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBrandData {
  name: string;
  name_ar: string;
  description?: string;
  logo?: string;
}

// Units
export interface Unit {
  id: number;
  name: string;
  name_ar: string;
  abbreviation: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUnitData {
  name: string;
  name_ar: string;
  abbreviation: string;
}

// Currencies
export interface Currency {
  id: number;
  name: string;
  code: string;
  symbol: string;
  exchange_rate: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCurrencyData {
  name: string;
  code: string;
  symbol: string;
  exchange_rate: number;
  is_default?: boolean;
}

export const settingsService = {
  // Brands
  getBrands: async () => {
    const response = await apiClient.get(BRANDS_ENDPOINTS.LIST);
    return response.data;
  },

  getBrand: async (id: number) => {
    const response = await apiClient.get(BRANDS_ENDPOINTS.SHOW(id));
    return response.data;
  },

  createBrand: async (data: CreateBrandData) => {
    const response = await apiClient.post(BRANDS_ENDPOINTS.CREATE, data);
    return response.data;
  },

  updateBrand: async (id: number, data: Partial<CreateBrandData>) => {
    const response = await apiClient.put(BRANDS_ENDPOINTS.UPDATE(id), data);
    return response.data;
  },

  deleteBrand: async (id: number) => {
    const response = await apiClient.delete(BRANDS_ENDPOINTS.DELETE(id));
    return response.data;
  },

  // Units
  getUnits: async () => {
    const response = await apiClient.get(UNITS_ENDPOINTS.LIST);
    return response.data;
  },

  getUnit: async (id: number) => {
    const response = await apiClient.get(UNITS_ENDPOINTS.SHOW(id));
    return response.data;
  },

  createUnit: async (data: CreateUnitData) => {
    const response = await apiClient.post(UNITS_ENDPOINTS.CREATE, data);
    return response.data;
  },

  updateUnit: async (id: number, data: Partial<CreateUnitData>) => {
    const response = await apiClient.put(UNITS_ENDPOINTS.UPDATE(id), data);
    return response.data;
  },

  deleteUnit: async (id: number) => {
    const response = await apiClient.delete(UNITS_ENDPOINTS.DELETE(id));
    return response.data;
  },

  // Currencies
  getCurrencies: async () => {
    const response = await apiClient.get(CURRENCIES_ENDPOINTS.LIST);
    return response.data;
  },

  getCurrency: async (id: number) => {
    const response = await apiClient.get(CURRENCIES_ENDPOINTS.SHOW(id));
    return response.data;
  },

  createCurrency: async (data: CreateCurrencyData) => {
    const response = await apiClient.post(CURRENCIES_ENDPOINTS.CREATE, data);
    return response.data;
  },

  updateCurrency: async (id: number, data: Partial<CreateCurrencyData>) => {
    const response = await apiClient.put(CURRENCIES_ENDPOINTS.UPDATE(id), data);
    return response.data;
  },

  deleteCurrency: async (id: number) => {
    const response = await apiClient.delete(CURRENCIES_ENDPOINTS.DELETE(id));
    return response.data;
  },
};
