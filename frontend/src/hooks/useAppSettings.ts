import { useQuery } from '@tanstack/react-query';
import { settingsService, AppSettings } from '@/api/settingsService';
import { useAuth } from '@/contexts/AuthContext';

export const useAppSettings = () => {
  const { isAuthenticated } = useAuth(); // 👈 نجيب حالة تسجيل الدخول

  const { data, isLoading, isError, error } = useQuery<AppSettings>({
    queryKey: ['settings'],
    queryFn: () => settingsService.getSettings(),

    // 👇 أهم سطر في الحل
    enabled: isAuthenticated,

    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  return { settings: data, isLoading, isError, error };
};
