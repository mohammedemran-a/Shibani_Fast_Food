import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { unitService, type CreateUnitRequest, type UpdateUnitRequest } from '@/api/unitService';

export const useUnits = (params?: any) => {
  return useQuery({
    queryKey: ['units', params],
    queryFn: () => unitService.getAll(params),
  });
};

export const useUnit = (id: number) => {
  return useQuery({
    queryKey: ['unit', id],
    queryFn: () => unitService.getById(id),
    enabled: !!id,
  });
};

export const useCreateUnit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateUnitRequest) => unitService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
  });
};

export const useUpdateUnit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUnitRequest }) =>
      unitService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
  });
};

export const useDeleteUnit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => unitService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
  });
};
