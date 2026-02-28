import apiClient from './apiClient';
import { PRODUCTS_ENDPOINTS } from './endpoints';

// =================================================================
// 1. تعريف الأنواع (لا تغيير هنا)
// =================================================================

export interface ProductStockBatch {
    id: number;
    product_id: number;
    quantity_received: number;
    quantity_remaining: number;
    purchase_price_per_unit: number;
    expiry_date?: string | null;
    notes?: string | null;
    created_at: string;
    updated_at: string;
}

export interface ProductBarcode {
    id: number;
    product_id: number;
    barcode?: string | null;
    unit_name: string;
    unit_quantity: number;
    selling_price?: number | null;
    is_base_unit: boolean;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: number;
    name: string;
    name_ar?: string;
}

export interface Brand {
    id: number;
    name: string;
    name_ar?: string;
}

export interface Product {
    id: number;
    name: string;
    name_ar?: string;
    sku: string;
    description?: string | null;
    category_id: number;
    brand_id?: number | null;
    product_type: 'Standard' | 'Weighted';
    reorder_level?: number;
    image?: string | null;
    image_url?: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    category?: Category;
    brand?: Brand;
    stock_batches?: ProductStockBatch[];
    barcodes?: ProductBarcode[];
}

export interface ProductsResponse {
  success: boolean;
  data: {
    data: Product[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ProductResponse {
  success: boolean;
  message?: string;
  data: Product;
}

export interface GenericResponse {
    success: boolean;
    message: string;
    data?: any;
}

// =================================================================
// 2. تحديث كلاس الخدمة (لا تغيير هنا)
// =================================================================

class ProductService {
  async getProducts(params?: Record<string, any>): Promise<ProductsResponse> {
    const response = await apiClient.get<ProductsResponse>(PRODUCTS_ENDPOINTS.LIST, { params });
    return response.data;
  }

  async getProduct(id: number): Promise<ProductResponse> {
    const response = await apiClient.get<ProductResponse>(PRODUCTS_ENDPOINTS.GET(id));
    return response.data;
  }

  async createProduct(data: FormData): Promise<GenericResponse> {
    const response = await apiClient.post<GenericResponse>(
      PRODUCTS_ENDPOINTS.CREATE,
      data,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  }

  async updateProduct(id: number, data: FormData): Promise<GenericResponse> {
    data.append('_method', 'PUT');
    const response = await apiClient.post<GenericResponse>(
      PRODUCTS_ENDPOINTS.UPDATE(id),
      data,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  }

  async deleteProduct(id: number): Promise<GenericResponse> {
    const response = await apiClient.delete<GenericResponse>(PRODUCTS_ENDPOINTS.DELETE(id));
    return response.data;
  }

  async searchByBarcode(barcode: string): Promise<ProductsResponse> {
    return this.getProducts({ search: barcode });
  }

  async getByCategory(categoryId: number): Promise<ProductsResponse> {
    return this.getProducts({ category_id: categoryId });
  }

  async getLowStockProducts(): Promise<ProductsResponse> {
    const response = await this.getProducts({ per_page: 1000 });
    const lowStock = response.data.data.filter(
      (product) => {
        const totalStock = product.stock_batches?.reduce((sum, batch) => sum + batch.quantity_remaining, 0) ?? 0;
        return product.reorder_level ? totalStock <= product.reorder_level : false;
      }
    );
    return {
      ...response,
      data: {
        ...response.data,
        data: lowStock,
      },
    };
  }
}

// =================================================================
// 3. الحل الجذري والنهائي: تعريف وتصدير الدالة الجديدة بشكل صحيح
// =================================================================

/**
 * ✅ دالة جديدة ومخصصة لتحديث حالة المنتج فقط
 */
export const updateProductStatus = async (id: number, isActive: boolean): Promise<GenericResponse> => {
    // ✅ استخدام `patch` والمسار الجديد
    const response = await apiClient.patch<GenericResponse>(`/products/${id}/status`, { is_active: isActive });
    return response.data;
};

const productService = new ProductService();

export { productService };
