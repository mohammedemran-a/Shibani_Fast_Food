/**
 * خدمة مرتجعات المشتريات
 * 
 * توفر جميع الوظائف المتعلقة بإرجاع المنتجات للموردين
 */

import { apiClient } from './apiClient';

/**
 * واجهة بيانات المرتجع
 */
export interface PurchaseReturn {
  id: number;
  return_number: string;
  purchase_invoice_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  reason?: string;
  return_date: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  purchase_invoice?: any;
  product?: any;
  creator?: any;
}

/**
 * واجهة بيانات إنشاء مرتجع جديد
 */
export interface CreatePurchaseReturnData {
  purchase_invoice_id: number;
  product_id: number;
  quantity: number;
  reason?: string;
  return_date: string;
  notes?: string;
}

/**
 * واجهة معاملات الفلترة
 */
export interface GetPurchaseReturnsParams {
  purchase_invoice_id?: number;
  status?: string;
  from_date?: string;
  to_date?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

/**
 * خدمة مرتجعات المشتريات
 */
export const purchaseReturnService = {
  /**
   * الحصول على قائمة المرتجعات مع الفلترة
   * 
   * @param params - معاملات الفلترة
   * @returns قائمة المرتجعات
   */
  getPurchaseReturns: async (params?: GetPurchaseReturnsParams) => {
    const response = await apiClient.get('/purchase-returns', { params });
    return response.data;
  },

  /**
   * الحصول على تفاصيل مرتجع محدد
   * 
   * @param id - معرف المرتجع
   * @returns تفاصيل المرتجع
   */
  getPurchaseReturn: async (id: number) => {
    const response = await apiClient.get(`/purchase-returns/${id}`);
    return response.data;
  },

  /**
   * إنشاء مرتجع جديد
   * 
   * @param data - بيانات المرتجع
   * @returns المرتجع المنشأ
   */
  createPurchaseReturn: async (data: CreatePurchaseReturnData) => {
    const response = await apiClient.post('/purchase-returns', data);
    return response.data;
  },

  /**
   * تحديث حالة مرتجع
   * 
   * @param id - معرف المرتجع
   * @param data - البيانات المحدثة
   * @returns المرتجع المحدث
   */
  updatePurchaseReturn: async (
    id: number,
    data: {
      status: 'pending' | 'approved' | 'rejected';
      notes?: string;
    }
  ) => {
    const response = await apiClient.put(`/purchase-returns/${id}`, data);
    return response.data;
  },

  /**
   * حذف مرتجع
   * 
   * @param id - معرف المرتجع
   * @returns رسالة النجاح
   */
  deletePurchaseReturn: async (id: number) => {
    const response = await apiClient.delete(`/purchase-returns/${id}`);
    return response.data;
  },
};

export default purchaseReturnService;
