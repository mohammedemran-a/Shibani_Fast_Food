import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
// ✅ 1. استيراد كل الدوال التي نحتاجها من الـ API
import { getAdminProducts, getProductById } from '@/api'; 
import { Product, ProductFilters, PaginatedResponse } from '@/types';
import { useDebounce } from './useDebounce';
import { useDeleteProduct } from './useProductMutations';

// ==================================================================
// Hook رقم 1: لجلب قائمة المنتجات (للجدول الرئيسي)
// ==================================================================
export const useProducts = () => {
  const [filters, setFilters] = useState<ProductFilters>({ name: '', type: '' });
  const debouncedNameFilter = useDebounce(filters.name, 500);

  const { data, isLoading, error } = useQuery<PaginatedResponse<Product>, Error>({
    queryKey: ['products', { ...filters, name: debouncedNameFilter }],
    queryFn: () => getAdminProducts({ ...filters, name: debouncedNameFilter }),
  });

  const deleteMutation = useDeleteProduct();

  const removeProduct = async (id: number) => {
    return deleteMutation.mutateAsync(id);
  };

  return {
    products: data?.data ?? [],
    pagination: data ? { current_page: data.current_page, last_page: data.last_page, total: data.total } : null,
    loading: isLoading,
    error: error?.message || null,
    filters,
    setFilters,
    removeProduct,
  };
};

// ==================================================================
// ✅✅✅ Hook رقم 2: لجلب منتج واحد (لصفحة التعديل) ✅✅✅
// ==================================================================
/**
 * Hook مخصص لجلب بيانات منتج واحد محدد بالـ ID (بكل تفاصيله).
 * @param productId - الـ ID الخاص بالمنتج المطلوب جلبه.
 */
export const useProduct = (productId: string | undefined) => {
  return useQuery<Product, Error>({
    // مفتاح الكويري: يتضمن 'product' والـ ID لضمان التفرد
    queryKey: ['product', productId],
    
    // دالة الجلب: تستدعي دالة الـ API التي تجلب منتجًا واحدًا
    queryFn: () => getProductById(productId!),

    // enabled: false - هذا الخيار يمنع تشغيل الكويري تلقائيًا إذا كان الـ ID غير موجود
    enabled: !!productId, 
  });
};
