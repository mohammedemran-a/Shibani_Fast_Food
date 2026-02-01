// frontend/src/hooks/useProductPerformance.ts

import { useQuery, keepPreviousData } from '@tanstack/react-query'; // استيراد `keepPreviousData` للإصدار 5
import { 
  getProductPerformanceAnalytics, 
  AnalyticsQueryOptions,
  ProductPerformanceData 
} from '../api/analyticsService';

/**
 * Hook مخصص لجلب وإدارة بيانات تحليل أداء المنتجات.
 * 
 * يستخدم React Query للتعامل مع جلب البيانات، التخزين المؤقت (caching)،
 * حالات التحميل، والأخطاء، مع الحفاظ على البيانات السابقة أثناء التحديث.
 * هذا يتبع أفضل الممارسات لفصل منطق جلب البيانات وتحسين تجربة المستخدم.
 * 
 * @param {AnalyticsQueryOptions} options - كائن يحتوي على خيارات التصفية (startDate, endDate, limit, etc.)
 *                                        التي سيتم تمريرها إلى الـ API.
 * 
 * @returns {UseQueryResult} كائن يحتوي على حالة الاستعلام من React Query، بما في ذلك:
 *   - `data`: البيانات التي تم جلبها من الـ API.
 *   - `isLoading`: قيمة منطقية تكون `true` أثناء أول عملية جلب للبيانات.
 *   - `isFetching`: قيمة منطقية تكون `true` عند كل عملية جلب (بما في ذلك إعادة الجلب في الخلفية).
 *   - `isError`: قيمة منطقية تكون `true` في حالة حدوث خطأ.
 *   - `error`: كائن الخطأ نفسه.
 */
export const useProductPerformance = (options: AnalyticsQueryOptions = {}) => {
  
  // مفتاح الاستعلام (Query Key):
  // يُستخدم لتعريف هذا الاستعلام بشكل فريد في ذاكرة التخزين المؤقت لـ React Query.
  // يتكون من اسم ثابت ('productPerformance') وكائن الخيارات المتغيرة.
  // هذا يضمن إعادة الجلب التلقائي عند تغيير أي من خيارات التصفية.
  const queryKey = ['productPerformance', options];

  // دالة الجلب (Query Function):
  // هي دالة غير متزامنة تستدعي خدمة الـ API التي أنشأناها.
  // React Query يتولى استدعاء هذه الدالة عند الحاجة.
  const queryFn = () => getProductPerformanceAnalytics(options);

  // استخدام `useQuery` مع الخيارات الصحيحة والمحسّنة:
  return useQuery<ProductPerformanceData, Error>({
    queryKey: queryKey,
    queryFn: queryFn,
    
    // **الحل للخطأ السابق (لـ React Query v5+):**
    // نستخدم `placeholderData` مع الدالة المساعدة `keepPreviousData`.
    // هذا يحافظ على عرض البيانات القديمة للمستخدم أثناء تحميل البيانات الجديدة،
    // مما يمنع وميض الشاشة ويحسن تجربة المستخدم بشكل كبير.
    placeholderData: keepPreviousData,

    // `staleTime`:
    // يحدد المدة التي تعتبر فيها البيانات "طازجة" (fresh).
    // خلال هذه الفترة (5 دقائق)، لن يقوم React Query بإرسال طلب جديد للشبكة
    // عند إعادة تحميل المكون، بل سيعيد البيانات من الكاش مباشرة.
    // هذا يقلل من طلبات الشبكة غير الضرورية ويحسن الأداء.
    staleTime: 5 * 60 * 1000, // 5 دقائق
  });
};
