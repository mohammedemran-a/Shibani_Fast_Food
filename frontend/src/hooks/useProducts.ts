import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService, {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductsResponse,
  ProductResponse,
} from '@/api/productService';
import { toast } from 'sonner';

// Query Keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
};

/**
 * Hook to fetch all products with caching
 */
export function useProducts(params?: {
  search?: string;
  category_id?: number;
  brand_id?: number;
  is_active?: boolean;
  per_page?: number;
  page?: number;
}) {
  return useQuery<ProductsResponse>({
    queryKey: productKeys.list(params || {}),
    queryFn: () => productService.getProducts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}

/**
 * Hook to fetch single product with caching
 */
export function useProduct(id: number) {
  return useQuery<ProductResponse>({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.getProduct(id),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!id, // Only run if id exists
  });
}

/**
 * Hook to create new product
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductRequest | FormData) => productService.createProduct(data),
    onSuccess: (response) => {
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success(response.message || 'تمت إضافة المنتج بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في إضافة المنتج');
    },
  });
}

/**
 * Hook to update product
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductRequest }) =>
      productService.updateProduct(id, data),
    onSuccess: (response, variables) => {
      // Invalidate lists and specific product
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
      toast.success(response.message || 'تم تحديث المنتج بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في تحديث المنتج');
    },
  });
}

/**
 * Hook to delete product
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productService.deleteProduct(id),
    onSuccess: (response) => {
      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success(response.message || 'تم حذف المنتج بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في حذف المنتج');
    },
  });
}

/**
 * Hook to search products by barcode
 */
export function useSearchByBarcode(barcode: string) {
  return useQuery<ProductsResponse>({
    queryKey: [...productKeys.lists(), 'barcode', barcode],
    queryFn: () => productService.searchByBarcode(barcode),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!barcode && barcode.length > 0,
  });
}

/**
 * Hook to get products by category
 */
export function useProductsByCategory(categoryId: number) {
  return useQuery<ProductsResponse>({
    queryKey: [...productKeys.lists(), 'category', categoryId],
    queryFn: () => productService.getByCategory(categoryId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!categoryId,
  });
}

/**
 * Hook to get low stock products
 */
export function useLowStockProducts() {
  return useQuery<ProductsResponse>({
    queryKey: [...productKeys.lists(), 'low-stock'],
    queryFn: () => productService.getLowStockProducts(),
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent updates)
    gcTime: 5 * 60 * 1000,
  });
}
