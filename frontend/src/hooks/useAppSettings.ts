import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { settingsService } from '@/api/settingsService';

/**
 * Hook لتحديث إعدادات التطبيق (العنوان والأيقونة)
 */
export const useAppSettings = () => {
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getSettings(),
  });

  useEffect(() => {
    if (settings) {
      // تحديث عنوان الصفحة
      if (settings.company_name) {
        document.title = settings.company_name;
      }

      // تحديث الأيقونة (favicon)
      if (settings.company_logo) {
        // حذف جميع الأيقونات القديمة
        const existingFavicons = document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']");
        existingFavicons.forEach(favicon => favicon.remove());
        
        // إضافة أيقونة جديدة مع timestamp لإجبار التحديث
        const newFavicon = document.createElement('link');
        newFavicon.rel = 'icon';
        newFavicon.type = 'image/x-icon';
        newFavicon.href = `${settings.company_logo}?t=${Date.now()}`;
        document.head.appendChild(newFavicon);
      }
    }
  }, [settings]);

  return settings;
};
