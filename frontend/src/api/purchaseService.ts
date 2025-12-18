import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './endpoints';

export interface PurchaseInvoiceItem {
  product_id: number;
  quantity: number;
  unit_price: number;
}

export interface PurchaseInvoice {
  id: number;
  invoice_number: string;
  supplier_id: number;
  invoice_date: string;
  due_date?: string;
  total_amount: number;
  paid_amount: number;
  status: 'pending' | 'partial' | 'paid' | 'cancelled';
  notes?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  items?: PurchaseInvoiceItem[];
}

export interface CreatePurchaseInvoiceData {
  supplier_id: number;
  invoice_date: string;
  due_date?: string;
  items: PurchaseInvoiceItem[];
  paid_amount?: number;
  notes?: string;
}

export interface GetPurchasesParams {
  supplier_id?: number;
  status?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
  per_page?: number;
}

export const purchaseService = {
  // Get all purchase invoices
  getPurchases: async (params?: GetPurchasesParams) => {
    const response = await apiClient.get(API_ENDPOINTS.PURCHASES.LIST, { params });
    return response.data;
  },

  // Get purchase invoice by ID
  getPurchase: async (id: number) => {
    const response = await apiClient.get(API_ENDPOINTS.PURCHASES.SHOW(id));
    return response.data;
  },

  // Create new purchase invoice
  createPurchase: async (data: CreatePurchaseInvoiceData) => {
    const response = await apiClient.post(API_ENDPOINTS.PURCHASES.CREATE, data);
    return response.data;
  },

  // Update purchase invoice
  updatePurchase: async (id: number, data: Partial<CreatePurchaseInvoiceData>) => {
    const response = await apiClient.put(API_ENDPOINTS.PURCHASES.UPDATE(id), data);
    return response.data;
  },

  // Delete purchase invoice
  deletePurchase: async (id: number) => {
    const response = await apiClient.delete(API_ENDPOINTS.PURCHASES.DELETE(id));
    return response.data;
  },
};
