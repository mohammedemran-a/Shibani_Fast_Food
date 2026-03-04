import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/apiClient'; // تأكد من المسار الصحيح

// تأكد من أن هذا النوع يتطابق مع ما يرسله المتحكم
export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  unit: string;
  currentQty: number;
  minQty: number;
  costPerUnit: number;
}

// الخدمة التي تجلب بيانات المخزون
const getInventory = async (search: string = ''): Promise<InventoryItem[]> => {
  const response = await apiClient.get('/inventory', {
    // ✅✅✅ هذا هو التعديل الحاسم ✅✅✅
    // إرسال مصطلح البحث إلى الواجهة الخلفية
    params: {
      search: search,
    },
  });
  return response.data;
};

// الـ Hook الذي يستخدم الخدمة
export const useInventory = (searchTerm: string) => {
  const { data, isLoading, isError, refetch } = useQuery({
    // ✅ مفتاح الكاش يجب أن يتضمن مصطلح البحث ليعمل بشكل صحيح
    queryKey: ['inventory', searchTerm],
    queryFn: () => getInventory(searchTerm),
    // خيارات إضافية لتحسين تجربة المستخدم
    placeholderData: (previousData) => previousData, // إبقاء البيانات القديمة ظاهرة أثناء التحميل
    staleTime: 5 * 60 * 1000, // 5 دقائق قبل أن تعتبر البيانات قديمة
  });

  return {
    items: data ?? [], // إرجاع مصفوفة فارغة دائمًا لتجنب الأخطاء
    isLoading,
    isError,
    refetch,
  };
};
