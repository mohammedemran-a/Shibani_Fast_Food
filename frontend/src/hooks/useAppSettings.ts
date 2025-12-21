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
        const favicon = document.querySelector<HTMLLinkElement>("link[rel='icon']");
        if (favicon) {
          favicon.href = settings.company_logo;
        } else {
          // إنشاء عنصر favicon جديد إذا لم يكن موجوداً
          const newFavicon = document.createElement('link');
          newFavicon.rel = 'icon';
          newFavicon.href = settings.company_logo;
          document.head.appendChild(newFavicon);
        }
      }
    }
  }, [settings]);

  return settings;
};
