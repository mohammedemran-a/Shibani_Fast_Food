import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAdminProducts } from '@/api';
import { Product, ProductFilters } from '@/types';
import { useDebounce } from './useDebounce';
import { useDeleteProduct } from './useProductMutations'; // ✅ 1. استيراد hook الحذف

export const useProducts = () => {
  const [filters, setFilters] = useState<ProductFilters>({ name: '', type: '' });
  const debouncedNameFilter = useDebounce(filters.name, 500);

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', { ...filters, name: debouncedNameFilter }],
    queryFn: () => getAdminProducts({ ...filters, name: debouncedNameFilter }),
  });

  const deleteMutation = useDeleteProduct(); // ✅ 2. استخدام hook الحذف

  // ✅ 3. تعريف دالة الحذف التي سيتم إرجاعها
  const removeProduct = async (id: number) => {
    return deleteMutation.mutateAsync(id);
  };

  return {
    products: data?.data || [],
    pagination: data ? { current_page: data.current_page, last_page: data.last_page, total: data.total } : null,
    loading: isLoading,
    error: error?.message || null,
    filters,
    setFilters,
    removeProduct, // ✅ 4. إرجاع الدالة لتكون متاحة في ProductsList
  };
};
