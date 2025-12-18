import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { brandService, type CreateBrandRequest, type UpdateBrandRequest } from '@/api/brandService';

export const useBrands = (params?: any) => {
  return useQuery({
    queryKey: ['brands', params],
    queryFn: () => brandService.getAll(params),
  });
};

export const useBrand = (id: number) => {
  return useQuery({
    queryKey: ['brand', id],
    queryFn: () => brandService.getById(id),
    enabled: !!id,
  });
};

export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateBrandRequest) => brandService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });
};

export const useUpdateBrand = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBrandRequest }) =>
      brandService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });
};

export const useDeleteBrand = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => brandService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });
};
