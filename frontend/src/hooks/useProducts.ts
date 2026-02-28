import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  productService,
  ProductsResponse,
  ProductResponse,
  updateProductStatus, // ✅ استيراد الدالة الجديدة
} from '@/api/productService';
import { toast } from 'sonner';
import { z } from 'zod';
import { Product } from '@/api/productService'; // ✅ استيراد نوع المنتج

// =================================================================
// 1. مخطط Zod - لا تغيير هنا
// =================================================================
const productFormSchema = z.object({
    name: z.string().min(2, { message: "اسم المنتج مطلوب." }),
    category_id: z.string({ required_error: "يجب اختيار الفئة." }),
    brand_id: z.string().optional(),
    product_type: z.enum(['Standard', 'Weighted'], { required_error: "يجب تحديد نوع المنتج." }),
    base_unit: z.object({
        name: z.string().min(1, { message: "اسم الوحدة الأساسية مطلوب." }),
        barcode: z.string().optional(),
    }),
    additional_units: z.array(z.object({
        name: z.string().min(1, { message: "اسم الوحدة مطلوب." }),
        conversion_factor: z.coerce.number().gt(0, { message: "يجب أن يكون أكبر من صفر." }),
        barcode: z.string().optional(),
        selling_price: z.coerce.number().min(0).optional(),
    })).optional(),
    initial_batch: z.object({
        quantity: z.coerce.number().min(0).optional(),
        cost_price: z.coerce.number().min(0).optional(),
        expiry_date: z.string().optional(),
    }).optional(),
    base_selling_price: z.coerce.number().min(0, { message: "سعر البيع مطلوب." }),
    sku: z.string().optional(),
    reorder_level: z.coerce.number().optional(),
    description: z.string().optional(),
    is_active: z.boolean().default(true),
}).refine(data => {
    if (data.initial_batch?.quantity && data.initial_batch.quantity > 0) {
        return data.initial_batch.cost_price !== undefined && data.initial_batch.cost_price >= 0;
    }
    return true;
}, {
    message: "يجب إدخال سعر التكلفة للدفعة الأولية.",
    path: ["initial_batch", "cost_price"],
});

type ProductFormValues = z.infer<typeof productFormSchema>;


// Query Keys (لا تغيير هنا)
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
};

export function useProducts(params?: Record<string, any>) {
  return useQuery<ProductsResponse>({
    queryKey: productKeys.list(params || {}),
    queryFn: () => productService.getProducts(params),
    staleTime: 5 * 60 * 1000, // 5 دقائق
    gcTime: 10 * 60 * 1000,    // 10 دقائق
  });
}

// useProduct (لا تغيير هنا)
export function useProduct(id: number) {
  return useQuery<ProductResponse>({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.getProduct(id),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!id,
  });
}

// useCreateProduct (لا تغيير هنا)
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData) => productService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
    onError: (error: any) => {
      throw error;
    },
  });
}

// useUpdateProduct (لا تغيير هنا)
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) =>
      productService.updateProduct(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
    },
    onError: (error: any) => {
      throw error;
    }
  });
}

// useDeleteProduct (لا تغيير هنا)
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => productService.deleteProduct(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success(response.message || 'تم حذف المنتج بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في حذف المنتج');
    },
  });
}

/**
 * ✅ ===================================================================
 * ✅ الحل: hook جديد ومخصص لتحديث حالة المنتج فقط
 * ✅ ===================================================================
 */
export const useUpdateProductStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => updateProductStatus(id, isActive),
        onSuccess: () => {
            // تحديث قائمة المنتجات بعد تغيير الحالة
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        },
    });
};
