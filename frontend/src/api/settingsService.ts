import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './endpoints';

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
    const response = await apiClient.get(API_ENDPOINTS.BRANDS.LIST);
    return response.data;
  },

  getBrand: async (id: number) => {
    const response = await apiClient.get(API_ENDPOINTS.BRANDS.SHOW(id));
    return response.data;
  },

  createBrand: async (data: CreateBrandData) => {
    const response = await apiClient.post(API_ENDPOINTS.BRANDS.CREATE, data);
    return response.data;
  },

  updateBrand: async (id: number, data: Partial<CreateBrandData>) => {
    const response = await apiClient.put(API_ENDPOINTS.BRANDS.UPDATE(id), data);
    return response.data;
  },

  deleteBrand: async (id: number) => {
    const response = await apiClient.delete(API_ENDPOINTS.BRANDS.DELETE(id));
    return response.data;
  },

  // Units
  getUnits: async () => {
    const response = await apiClient.get(API_ENDPOINTS.UNITS.LIST);
    return response.data;
  },

  getUnit: async (id: number) => {
    const response = await apiClient.get(API_ENDPOINTS.UNITS.SHOW(id));
    return response.data;
  },

  createUnit: async (data: CreateUnitData) => {
    const response = await apiClient.post(API_ENDPOINTS.UNITS.CREATE, data);
    return response.data;
  },

  updateUnit: async (id: number, data: Partial<CreateUnitData>) => {
    const response = await apiClient.put(API_ENDPOINTS.UNITS.UPDATE(id), data);
    return response.data;
  },

  deleteUnit: async (id: number) => {
    const response = await apiClient.delete(API_ENDPOINTS.UNITS.DELETE(id));
    return response.data;
  },

  // Currencies
  getCurrencies: async () => {
    const response = await apiClient.get(API_ENDPOINTS.CURRENCIES.LIST);
    return response.data;
  },

  getCurrency: async (id: number) => {
    const response = await apiClient.get(API_ENDPOINTS.CURRENCIES.SHOW(id));
    return response.data;
  },

  createCurrency: async (data: CreateCurrencyData) => {
    const response = await apiClient.post(API_ENDPOINTS.CURRENCIES.CREATE, data);
    return response.data;
  },

  updateCurrency: async (id: number, data: Partial<CreateCurrencyData>) => {
    const response = await apiClient.put(API_ENDPOINTS.CURRENCIES.UPDATE(id), data);
    return response.data;
  },

  deleteCurrency: async (id: number) => {
    const response = await apiClient.delete(API_ENDPOINTS.CURRENCIES.DELETE(id));
    return response.data;
  },
};
