// frontend/src/hooks/useKitchenOrders.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchKitchenOrders, updateOrderStatus, KitchenOrder, OrderStatus } from '@/api/kitchenService';

export const useKitchenOrders = () => {
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading, refetch } = useQuery<KitchenOrder[], Error>({
    queryKey: ['kitchenOrders'],
    queryFn: fetchKitchenOrders,
    refetchInterval: 10000, // إعادة الجلب كل 10 ثوانٍ
  });

  const { mutate: changeStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData<KitchenOrder[]>(['kitchenOrders'], (oldData = []) =>
        oldData.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      );
      toast.success('تم تحديث حالة الطلب بنجاح.');
    },
    onError: (error) => {
      toast.error(`فشل التحديث: ${error.message}`);
    },
  });

  return {
    orders,
    isLoading,
    isUpdatingStatus,
    changeStatus,
    refetch,
  };
};
