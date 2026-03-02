// frontend/src/hooks/useTables.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchTables, updateTableStatus, RestaurantTable, TableStatus } from '@/api/tableService';

export const useTables = () => {
  const queryClient = useQueryClient();

  const { data: tables = [], isLoading, refetch } = useQuery<RestaurantTable[], Error>({
    queryKey: ['tables'],
    queryFn: fetchTables,
    refetchInterval: 15000,
  });

  const { mutate: changeStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: updateTableStatus,
    onSuccess: (updatedTable) => {
      queryClient.setQueryData<RestaurantTable[]>(['tables'], (oldData = []) =>
        oldData.map((t) => (t.id === updatedTable.id ? updatedTable : t))
      );
      // استخدام نص عربي مباشر في رسالة التنبيه
      toast.success('تم تحديث حالة الطاولة بنجاح.');
    },
    onError: (error) => {
      toast.error(`فشل التحديث: ${error.message}`);
    },
  });

  return {
    tables,
    isLoading,
    isUpdatingStatus,
    changeStatus,
    refetch,
  };
};
