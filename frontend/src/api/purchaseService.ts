import { apiClient } from './apiClient';
import { CATEGORIES_ENDPOINTS, BRANDS_ENDPOINTS, UNITS_ENDPOINTS, CURRENCIES_ENDPOINTS, SALES_INVOICES_ENDPOINTS, PURCHASE_INVOICES_ENDPOINTS, SUPPLIERS_ENDPOINTS, DEBTS_ENDPOINTS, EXPENSES_ENDPOINTS, USERS_ENDPOINTS, ROLES_ENDPOINTS, REPORTS_ENDPOINTS } from './endpoints';

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
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  items?: PurchaseInvoiceItem[];
  supplier?: any;
  remaining_amount?: number;
  payment_status?: string;
}

export interface CreatePurchaseInvoiceData {
  supplier_id: number;
  invoice_date: string;
  due_date?: string;
  items: PurchaseInvoiceItem[];
  tax_amount?: number;
  discount_amount?: number;
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
    const response = await apiClient.get(PURCHASE_INVOICES_ENDPOINTS.LIST, { params });
    return response.data;
  },

  // Get purchase invoice by ID
  getPurchase: async (id: number) => {
    const response = await apiClient.get(PURCHASE_INVOICES_ENDPOINTS.SHOW(id));
    return response.data;
  },

  // Create new purchase invoice
  createPurchase: async (data: CreatePurchaseInvoiceData) => {
    const response = await apiClient.post(PURCHASE_INVOICES_ENDPOINTS.CREATE, data);
    return response.data;
  },

  // Update purchase invoice
  updatePurchase: async (id: number, data: Partial<CreatePurchaseInvoiceData>) => {
    const response = await apiClient.put(PURCHASE_INVOICES_ENDPOINTS.UPDATE(id), data);
    return response.data;
  },

  // Delete purchase invoice
  deletePurchase: async (id: number) => {
    const response = await apiClient.delete(PURCHASE_INVOICES_ENDPOINTS.DELETE(id));
    return response.data;
  },

  // Get invoice items for return
  getItemsForReturn: async (id: number) => {
    const response = await apiClient.get(`/purchase-invoices/${id}/items-for-return`);
    return response.data;
  },
};
