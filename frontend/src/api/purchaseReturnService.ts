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
  supplier_id: number;
  return_date: string;
  total_amount: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  purchase_invoice?: any;
  supplier?: any;
  items?: any[];
  creator?: any;
}

/**
 * واجهة بيانات إنشاء مرتجع جديد
 */
export interface CreatePurchaseReturnData {
  purchase_invoice_id: number;
  return_date: string;
  items: {
    product_id: number;
    quantity: number;
  }[];
  reason?: string;
  notes?: string;
}

/**
 * واجهة معاملات الفلترة
 */
export interface GetPurchaseReturnsParams {
  supplier_id?: number;
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
    const response = await apiClient.get('/returns', { params });
    return response.data;
  },

  /**
   * الحصول على تفاصيل مرتجع محدد
   * 
   * @param id - معرف المرتجع
   * @returns تفاصيل المرتجع
   */
  getPurchaseReturn: async (id: number) => {
    const response = await apiClient.get(`/returns/${id}`);
    return response.data;
  },

  /**
   * جلب المنتجات المتاحة للإرجاع من فاتورة معينة
   * 
   * @param invoiceId - معرف فاتورة الشراء
   * @returns المنتجات المتاحة للإرجاع
   */
  getAvailableItemsForReturn: async (invoiceId: number) => {
    const response = await apiClient.get(`/returns/invoice/${invoiceId}/available-items`);
    return response.data;
  },

  /**
   * إنشاء مرتجع جديد
   * 
   * @param data - بيانات المرتجع
   * @returns المرتجع المنشأ
   */
  createPurchaseReturn: async (data: CreatePurchaseReturnData) => {
    const response = await apiClient.post('/returns', data);
    return response.data;
  },

  /**
   * تحديث حالة مرتجع
   * 
   * @param id - معرف المرتجع
   * @param status - الحالة الجديدة
   * @returns المرتجع المحدث
   */
  updateReturnStatus: async (
    id: number,
    status: 'approved' | 'rejected'
  ) => {
    const response = await apiClient.post(`/returns/${id}/update-status`, { status });
    return response.data;
  },

  /**
   * حذف مرتجع
   * 
   * @param id - معرف المرتجع
   * @returns رسالة النجاح
   */
  deletePurchaseReturn: async (id: number) => {
    const response = await apiClient.delete(`/returns/${id}`);
    return response.data;
  },
};

export default purchaseReturnService;
