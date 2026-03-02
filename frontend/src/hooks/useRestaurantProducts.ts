import { useQueries } from '@tanstack/react-query';
import { restaurantProductService } from '../api/restaurantProductService';
import { RestaurantProduct, ProductCategory } from '../types';

// هذا هو شكل الكائن الذي سيعيده الـ hook الخاص بنا
interface RestaurantMenuData {
  products: RestaurantProduct[];
  categories: ProductCategory[];
  isLoading: boolean;
  isError: boolean;
}

/**
 * خطاف مخصص لجلب جميع بيانات قائمة الطعام (المنتجات والفئات) دفعة واحدة.
 * يستخدم `useQueries` من React Query لتنفيذ طلبين API بالتوازي لتحقيق أفضل أداء.
 */
export const useRestaurantProducts = (): RestaurantMenuData => {
  const results = useQueries({
    queries: [
      {
        queryKey: ['restaurantProducts'],
        queryFn: restaurantProductService.getProducts,
        staleTime: 1000 * 60 * 5, // تخزين البيانات لمدة 5 دقائق
      },
      {
        queryKey: ['restaurantCategories'],
        queryFn: restaurantProductService.getCategories,
        staleTime: 1000 * 60 * 5, // تخزين البيانات لمدة 5 دقائق
      },
    ],
  });

  const productsQuery = results[0];
  const categoriesQuery = results[1];

  // دمج النتائج في كائن واحد بسيط وسهل الاستخدام
  return {
    products: productsQuery.data ?? [], // إذا كانت البيانات غير موجودة، أرجع مصفوفة فارغة
    categories: categoriesQuery.data ?? [], // إذا كانت البيانات غير موجودة، أرجع مصفوفة فارغة
    isLoading: productsQuery.isLoading || categoriesQuery.isLoading,
    isError: productsQuery.isError || categoriesQuery.isError,
  };
};
