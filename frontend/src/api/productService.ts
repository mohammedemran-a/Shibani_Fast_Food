import apiClient from './apiClient';
import { PRODUCTS_ENDPOINTS } from './endpoints';

export interface Product {
  id: number;
  name: string;
  name_ar: string;
  sku: string;
  barcode: string;
  category_id: number;
  brand_id: number | null;
  unit_id: number;
  purchase_price: number;
  selling_price: number;
  quantity: number;
  reorder_level: number;
  expiry_date: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: { id: number; name: string; name_ar: string };
  brand?: { id: number; name: string; name_ar: string };
  unit?: { id: number; name: string; name_ar: string; abbreviation: string };
}

export interface CreateProductRequest {
  name: string;
  name_ar: string;
  sku: string;
  barcode: string;
  category_id: number;
  brand_id?: number | null;
  unit_id: number;
  purchase_price: number;
  selling_price: number;
  quantity: number;
  reorder_level?: number;
  expiry_date?: string | null;
  description?: string | null;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  is_active?: boolean;
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

class ProductService {
  /**
   * Get all products with pagination and filters
   */
  async getProducts(params?: {
    search?: string;
    category_id?: number;
    brand_id?: number;
    is_active?: boolean;
    per_page?: number;
    page?: number;
  }): Promise<ProductsResponse> {
    try {
      const response = await apiClient.get<ProductsResponse>(
        PRODUCTS_ENDPOINTS.LIST,
        { params }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get single product by ID
   */
  async getProduct(id: number): Promise<ProductResponse> {
    try {
      const response = await apiClient.get<ProductResponse>(
        PRODUCTS_ENDPOINTS.GET(id)
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create new product
   */
  async createProduct(data: CreateProductRequest): Promise<ProductResponse> {
    try {
      const response = await apiClient.post<ProductResponse>(
        PRODUCTS_ENDPOINTS.CREATE,
        data
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update product
   */
  async updateProduct(
    id: number,
    data: UpdateProductRequest
  ): Promise<ProductResponse> {
    try {
      const response = await apiClient.put<ProductResponse>(
        PRODUCTS_ENDPOINTS.UPDATE(id),
        data
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete product
   */
  async deleteProduct(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete<{ success: boolean; message: string }>(
        PRODUCTS_ENDPOINTS.DELETE(id)
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search products by barcode
   */
  async searchByBarcode(barcode: string): Promise<ProductsResponse> {
    try {
      return await this.getProducts({ search: barcode });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get products by category
   */
  async getByCategory(categoryId: number): Promise<ProductsResponse> {
    try {
      return await this.getProducts({ category_id: categoryId });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(): Promise<ProductsResponse> {
    try {
      const response = await this.getProducts();
      const lowStock = response.data.data.filter(
        (product) => product.quantity <= product.reorder_level
      );
      return {
        ...response,
        data: {
          ...response.data,
          data: lowStock,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}

export default new ProductService();
