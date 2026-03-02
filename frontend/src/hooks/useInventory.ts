// frontend/src/hooks/useInventory.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchInventoryItems, adjustStock, InventoryItem } from '@/api/inventoryService';

export const useInventory = () => {
  const queryClient = useQueryClient();

  const { data: items = [], isLoading, refetch } = useQuery<InventoryItem[], Error>({
    queryKey: ['inventoryItems'],
    queryFn: fetchInventoryItems,
  });

  const { mutate: adjustStockMutation, isPending: isAdjusting } = useMutation({
    mutationFn: adjustStock,
    onSuccess: (updatedItem) => {
      queryClient.setQueryData<InventoryItem[]>(['inventoryItems'], (oldData = []) =>
        oldData.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      );
      toast.success(`تم تعديل مخزون "${updatedItem.name}" بنجاح.`);
    },
    onError: (error) => {
      toast.error(`فشل التعديل: ${error.message}`);
    },
  });

  return {
    items,
    isLoading,
    isAdjusting,
    adjustStock: adjustStockMutation,
    refetch,
  };
};
