import apiClient from './apiClient';
import { Product, ProductPayload, ProductFilters, PaginatedResponse } from '@/types';

/**
 * خدمة API لإدارة المنتجات.
 */

// دالة لجلب المنتجات لصفحة الإدارة (مع فلترة وتقسيم صفحات)
export const getAdminProducts = async (filters: ProductFilters): Promise<PaginatedResponse<Product>> => {
  try {
    // ✅✅✅ هذا هو التعديل النهائي: تم تغيير المسار من '/admin/products' إلى '/products' ✅✅✅
    const response = await apiClient.get('/products', { params: filters });
    
    if (response && response.data) {
      return response.data;
    }
    return { data: [], current_page: 1, last_page: 1, total: 0 };
  } catch (error) {
    console.error("Error fetching admin products:", error);
    return { data: [], current_page: 1, last_page: 1, total: 0 };
  }
};

// دالة لجلب المنتجات لصفحة نقطة البيع (POS)
export const getPosProducts = async (categoryId?: number): Promise<Product[]> => {
  try {
    const response = await apiClient.get('/pos/products', {
      params: { category_id: categoryId }
    });
    if (response && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching POS products:", error);
    return [];
  }
};

/**
 * دالة للبحث عن المنتجات القابلة للبيع بالاسم (لشاشة POS).
 * @param query - النص المستخدم للبحث.
 */
export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    const response = await apiClient.get('/products/search', {
      params: { name: query }
    });
    if (response && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error("Error searching products:", error);
    return [];
  }
};

// دالة لجلب منتج واحد بالـ ID
export const getProductById = async (id: number | string): Promise<Product> => {
  const response = await apiClient.get(`/products/${id}`);
  return response.data.data; 
};

// دالة لإنشاء منتج جديد
export const createProduct = async (productData: ProductPayload): Promise<Product> => {
  const response = await apiClient.post('/products', productData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
};

// دالة لتحديث منتج موجود
export const updateProduct = async ({ id, productData }: { id: number; productData: ProductPayload }): Promise<Product> => {
  const response = await apiClient.post(`/products/${id}`, productData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
};

// دالة لحذف منتج
export const deleteProduct = async (id: number): Promise<void> => {
  await apiClient.delete(`/products/${id}`);
};
