// frontend/src/hooks/useBasketAnalysis.ts

import { useQuery } from '@tanstack/react-query';
import { getBasketAnalysis, BasketAnalysisQueryOptions, BasketPair } from '@/api/analyticsService';

/**
 * Hook مخصص لجلب بيانات تحليل السلة باستخدام React Query.
 * 
 * هذا الـ Hook يدير دورة حياة جلب البيانات، بما في ذلك:
 * - التخزين المؤقت (Caching) للبيانات لتجنب الطلبات المتكررة.
 * - إعادة الجلب التلقائي في الخلفية (Background Refetching).
 * - إدارة حالات التحميل (isLoading) والخطأ (isError).
 * - جعل البيانات متاحة للمكونات التي تستخدمه.
 * 
 * @param {BasketAnalysisQueryOptions} options - كائن يحتوي على خيارات التصفية (التواريخ، الحد الأقصى، إلخ).
 * @returns {object} - كائن يحتوي على `data`, `isLoading`, `isError`, `error`, `isFetching`.
 */
export const useBasketAnalysis = (options: BasketAnalysisQueryOptions = {}) => {
  return useQuery<BasketPair[], Error>({
    // 1. مفتاح الاستعلام (Query Key):
    //    - يتضمن اسم 'basketAnalysis' لتمييزه عن الاستعلامات الأخرى.
    //    - يتضمن كائن الخيارات `options` لضمان إعادة جلب البيانات تلقائيًا عند تغيير الفلاتر.
    queryKey: ['basketAnalysis', options],

    // 2. دالة الاستعلام (Query Function):
    //    - تستدعي دالة `getBasketAnalysis` التي أنشأناها في الخدمة.
    //    - تمرر لها كائن الخيارات.
    queryFn: () => getBasketAnalysis(options),

    // 3. خيارات إضافية لـ React Query:
    //    - `staleTime`: يمنع إعادة جلب البيانات "الطازجة" لمدة 5 دقائق.
    //      هذا يقلل من طلبات الشبكة غير الضرورية ويحسن الأداء.
    staleTime: 5 * 60 * 1000, // 5 دقائق

    //    - `placeholderData: (previousData) => previousData`:
    //      يحافظ على عرض البيانات القديمة أثناء جلب البيانات الجديدة (عند تغيير الفلاتر)،
    //      مما يوفر تجربة مستخدم سلسة بدون وميض أو اختفاء للمحتوى.
    placeholderData: (previousData) => previousData,
  });
};
