import { apiClient } from './apiClient';
// 1. استيراد نقاط النهاية (endpoints)
import { CATEGORIES_ENDPOINTS, BRANDS_ENDPOINTS, UNITS_ENDPOINTS, CURRENCIES_ENDPOINTS, SETTINGS_ENDPOINTS, SALES_INVOICES_ENDPOINTS, PURCHASE_INVOICES_ENDPOINTS, SUPPLIERS_ENDPOINTS, DEBTS_ENDPOINTS, EXPENSES_ENDPOINTS, USERS_ENDPOINTS, ROLES_ENDPOINTS, REPORTS_ENDPOINTS } from './endpoints';

// --- Brands ---
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

// --- Units ---
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

// --- Currencies ---
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

// =================================================================
// **2. إضافة نوع بيانات جديد للإعدادات العامة (AppSettings)**
// =================================================================
/**
 * يمثل هذا النوع جميع الإعدادات التي يتم جلبها من الواجهة الخلفية.
 * وهو يشمل الإعدادات العامة وإعدادات الولاء، مما يجعله نقطة الحقيقة الوحيدة
 * لجميع إعدادات التطبيق في الواجهة الأمامية.
 */
export interface AppSettings {
  // الإعدادات العامة
  company_name?: string;
  company_logo?: string;
  tax_rate?: number;
  default_currency_id?: number;
  
  // إعدادات الولاء
  loyalty_enabled?: boolean;
  loyalty_points_per_currency?: number;
  loyalty_currency_per_point?: number;
  loyalty_minimum_redemption?: number;
  loyalty_welcome_bonus?: number;
  loyalty_birthday_bonus?: number;
  loyalty_expiry_days?: number;
}

export const settingsService = {
  // --- Brands ---
  getBrands: async () => {
    const response = await apiClient.get(BRANDS_ENDPOINTS.LIST);
    return response.data.data || response.data;
  },
  getBrand: async (id: number) => {
    const response = await apiClient.get(BRANDS_ENDPOINTS.SHOW(id));
    return response.data.data || response.data;
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

  // --- Units ---
  getUnits: async () => {
    const response = await apiClient.get(UNITS_ENDPOINTS.LIST);
    return response.data.data || response.data;
  },
  getUnit: async (id: number) => {
    const response = await apiClient.get(UNITS_ENDPOINTS.SHOW(id));
    return response.data.data || response.data;
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

  // --- Currencies ---
  getCurrencies: async () => {
    const response = await apiClient.get(CURRENCIES_ENDPOINTS.LIST);
    return response.data.data || response.data;
  },
  getCurrency: async (id: number) => {
    const response = await apiClient.get(CURRENCIES_ENDPOINTS.SHOW(id));
    return response.data.data || response.data;
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

  // =================================================================
  // **3. تحديث دوال الإعدادات لاستخدام النوع الجديد**
  // =================================================================
  /**
   * يجلب جميع إعدادات النظام.
   * @returns {Promise<AppSettings>} - وعد يحتوي على كائن الإعدادات.
   */
  getSettings: async (): Promise<AppSettings> => {
    const response = await apiClient.get(SETTINGS_ENDPOINTS.LIST);
    return response.data.data || response.data;
  },

  /**
   * يقوم بتحديث إعدادات النظام.
   * @param {Partial<AppSettings>} data - كائن يحتوي على الإعدادات المراد تحديثها.
   * @returns {Promise<any>}
   */
  updateSettings: async (data: Partial<AppSettings>): Promise<any> => {
    const response = await apiClient.post(SETTINGS_ENDPOINTS.UPDATE, data);
    return response.data;
  },

  uploadLogo: async (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);
    const response = await apiClient.post(SETTINGS_ENDPOINTS.UPLOAD_LOGO, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getSetting: async (key: string) => {
    const response = await apiClient.get(SETTINGS_ENDPOINTS.GET(key));
    return response.data.data || response.data;
  },
};
