/**
 * خدمة العملاء
 * 
 * توفر جميع الوظائف المتعلقة بإدارة العملاء
 */

import { apiClient } from './apiClient';
import { CUSTOMERS_ENDPOINTS } from './endpoints';

/**
 * واجهة بيانات العميل
 */
export interface Customer {
  id: number;
  name: string;
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
  // إحصائيات
  sales_invoices_count?: number;
  sales_invoices_sum_total_amount?: number;
  debts_sum_remaining_amount?: number;
}

/**
 * واجهة بيانات إنشاء عميل جديد
 */
export interface CreateCustomerData {
  name: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  notes?: string;
}

/**
 * واجهة بيانات تحديث عميل
 */
export interface UpdateCustomerData extends Partial<CreateCustomerData> {
  is_active?: boolean;
  loyalty_points?: number;
}

/**
 * واجهة معاملات الفلترة
 */
export interface GetCustomersParams {
  search?: string;
  is_active?: boolean | string;
  city?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

/**
 * واجهة الاستجابة المُرقمة
 */
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

/**
 * خدمة العملاء
 */
export const customerService = {
  /**
   * الحصول على قائمة العملاء مع الفلترة
   * 
   * @param params - معاملات الفلترة
   * @returns قائمة العملاء
   */
  getCustomers: async (params?: GetCustomersParams) => {
    const response = await apiClient.get(CUSTOMERS_ENDPOINTS.LIST, { params });
    return response.data;
  },

  /**
   * الحصول على تفاصيل عميل محدد
   * 
   * @param id - معرف العميل
   * @returns تفاصيل العميل
   */
  getCustomer: async (id: number) => {
    const response = await apiClient.get(CUSTOMERS_ENDPOINTS.GET(id));
    return response.data;
  },

  /**
   * إنشاء عميل جديد
   * 
   * @param data - بيانات العميل
   * @returns العميل المنشأ
   */
  createCustomer: async (data: CreateCustomerData) => {
    const response = await apiClient.post(CUSTOMERS_ENDPOINTS.CREATE, data);
    return response.data;
  },

  /**
   * تحديث بيانات عميل
   * 
   * @param id - معرف العميل
   * @param data - البيانات المحدثة
   * @returns العميل المحدث
   */
  updateCustomer: async (id: number, data: UpdateCustomerData) => {
    const response = await apiClient.put(CUSTOMERS_ENDPOINTS.UPDATE(id), data);
    return response.data;
  },

  /**
   * حذف عميل
   * 
   * @param id - معرف العميل
   * @returns رسالة النجاح
   */
  deleteCustomer: async (id: number) => {
    const response = await apiClient.delete(CUSTOMERS_ENDPOINTS.DELETE(id));
    return response.data;
  },

  /**
   * تفعيل/تعطيل عميل
   * 
   * @param id - معرف العميل
   * @param isActive - الحالة الجديدة
   * @returns العميل المحدث
   */
  toggleCustomerStatus: async (id: number, isActive: boolean) => {
    const response = await apiClient.put(CUSTOMERS_ENDPOINTS.UPDATE(id), { is_active: isActive });
    return response.data;
  },
};
