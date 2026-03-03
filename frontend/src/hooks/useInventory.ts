import { useQuery } from '@tanstack/react-query';
import { fetchInventoryItems, InventoryItem } from '@/api/inventoryService';

/**
 * ✅ [تعديل] Hook مخصص لجلب بيانات المخزون مع دعم للبحث
 * 
 * @param search - نص البحث الذي يتم تمريره من المكون
 */
export const useInventory = (search: string) => {
  const { data: items = [], isLoading, refetch } = useQuery<InventoryItem[], Error>({
    // ✅ مفتاح الاستعلام يتضمن الآن نص البحث،
    // بحيث يتم إعادة الجلب تلقائيًا عند تغير البحث
    queryKey: ['inventoryItems', search], 
    
    // ✅ تمرير كائن البحث إلى دالة الجلب
    queryFn: () => fetchInventoryItems({ search }),

    // ✅ (اختياري) إضافة placeholderData لتحسين تجربة المستخدم
    placeholderData: (previousData) => previousData,
  });

  return {
    items,
    isLoading,
    refetch,
  };
};
