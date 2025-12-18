import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/apiClient';

// Query Keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
};

interface DashboardStats {
  success: boolean;
  data: {
    sales: {
      today: number;
      week: number;
      month: number;
      total: number;
    };
    purchases: {
      today: number;
      week: number;
      month: number;
      total: number;
    };
    products: {
      total: number;
      low_stock: number;
      out_of_stock: number;
      active: number;
    };
    people: {
      customers: number;
      suppliers: number;
      users: number;
    };
    profit: {
      today: number;
      week: number;
      month: number;
      total: number;
    };
    expenses: {
      today: number;
      week: number;
      month: number;
      total: number;
    };
    top_products: Array<{
      id: number;
      name: string;
      name_ar: string;
      total_sold: number;
      revenue: number;
    }>;
    sales_chart: Array<{
      date: string;
      amount: number;
    }>;
    purchases_chart: Array<{
      date: string;
      amount: number;
    }>;
    last_updated: string;
  };
}

/**
 * Hook to fetch dashboard statistics with caching
 * @param period - today, week, month, all, custom
 * @param startDate - Custom start date (YYYY-MM-DD)
 * @param endDate - Custom end date (YYYY-MM-DD)
 */
export function useDashboard(period: string = 'all', startDate?: string, endDate?: string) {
  return useQuery<DashboardStats>({
    queryKey: [...dashboardKeys.stats(), period, startDate, endDate],
    queryFn: async () => {
      const params: Record<string, string> = { period };
      if (period === 'custom' && startDate && endDate) {
        params.start_date = startDate;
        params.end_date = endDate;
      }
      const response = await apiClient.get<DashboardStats>('/dashboard', { params });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
  });
}

/**
 * Hook to refresh dashboard cache manually
 */
export function useRefreshDashboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<DashboardStats>('/analytics/refresh-cache');
      return response.data;
    },
    onSuccess: (data) => {
      // Update cache with new data
      queryClient.setQueryData(dashboardKeys.stats(), data);
    },
  });
}

/**
 * Hook to clear dashboard cache
 */
export function useClearDashboardCache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/analytics/clear-cache');
      return response.data;
    },
    onSuccess: () => {
      // Invalidate dashboard queries to force refetch
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}
