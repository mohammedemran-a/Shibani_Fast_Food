import { useQuery } from '@tanstack/react-query';
// 1. استيراد النوع الجديد ودالة الخدمة
import { settingsService, AppSettings } from '@/api/settingsService';

/**
 * Hook مخصص لجلب إعدادات التطبيق العامة.
 * 
 * هذا الـ Hook مسؤول فقط عن جلب البيانات وتوفيرها للمكونات.
 * تم نقل منطق تحديث عنوان الصفحة والأيقونة إلى مكون الواجهة الرئيسي
 * لضمان فصل المسؤوليات (Separation of Concerns).
 * 
 * @returns {object} - يحتوي على بيانات الإعدادات وحالات التحميل والخطأ.
 */
export const useAppSettings = () => {
  // 2. استخدام النوع `AppSettings` لضمان سلامة الأنواع
  const { data, isLoading, isError, error } = useQuery<AppSettings>({
    queryKey: ['settings'],
    queryFn: () => settingsService.getSettings(),
    // خيارات إضافية لتحسين الأداء
    staleTime: 1000 * 60 * 5, // 5 دقائق
    refetchOnWindowFocus: false,
  });

  // 3. إرجاع كائن React Query بالكامل لتوفير مرونة أكبر للمكونات
  return { settings: data, isLoading, isError, error };
};
