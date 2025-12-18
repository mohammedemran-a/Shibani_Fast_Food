import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, ShoppingCart, TrendingUp, Package, Users, Truck, RotateCcw, Wallet } from 'lucide-react';
import { StatsCard, SalesChart, RecentSalesTable, TopProductsList, SmartInsights, SalesForecast } from '@/components/dashboard';
import { reportService, productService } from '@/api';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();

  // Fetch dashboard statistics from API
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: reportService.getDashboardStats,
  });

  // Fetch low stock products count
  const { data: lowStockData } = useQuery({
    queryKey: ['low-stock-products'],
    queryFn: productService.getLowStockProducts,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {t('dashboard.title')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t('dashboard.welcome')}! {t('dashboard.overview')}
        </p>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t('dashboard.totalSales')}
          value={`$${stats?.data?.total_sales?.toLocaleString() || '0'}`}
          change={`+12.5% ${t('dashboard.fromLastWeek')}`}
          changeType="positive"
          icon={DollarSign}
          variant="primary"
        />
        <StatsCard
          title={t('dashboard.totalPurchases')}
          value={`$${stats?.data?.total_purchases?.toLocaleString() || '0'}`}
          change={`+8.2% ${t('dashboard.fromLastWeek')}`}
          changeType="positive"
          icon={ShoppingCart}
          variant="accent"
        />
        <StatsCard
          title={t('dashboard.totalProfit')}
          value={`$${stats?.data?.total_profit?.toLocaleString() || '0'}`}
          change={`+15.3% ${t('dashboard.fromLastWeek')}`}
          changeType="positive"
          icon={TrendingUp}
          variant="success"
        />
        <StatsCard
          title={t('dashboard.totalProducts')}
          value={lowStockData?.data?.total || '0'}
          change={`${lowStockData?.data?.data?.length || 0} ${t('dashboard.lowStock')}`}
          changeType="warning"
          icon={Package}
          variant="warning"
        />
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t('dashboard.totalCustomers')}
          value="142"
          change={`+5 ${t('dashboard.thisMonth')}`}
          changeType="positive"
          icon={Users}
          variant="primary"
        />
        <StatsCard
          title={t('dashboard.totalSuppliers')}
          value="18"
          change={`+2 ${t('dashboard.thisMonth')}`}
          changeType="positive"
          icon={Truck}
          variant="accent"
        />
        <StatsCard
          title={t('dashboard.totalReturns')}
          value="$450"
          change={`-3.2% ${t('dashboard.fromLastWeek')}`}
          changeType="negative"
          icon={RotateCcw}
          variant="warning"
        />
        <StatsCard
          title={t('dashboard.cashInHand')}
          value={`$${stats?.data?.total_expenses?.toLocaleString() || '0'}`}
          change={t('dashboard.currentBalance')}
          changeType="neutral"
          icon={Wallet}
          variant="success"
        />
      </div>

      {/* Smart Insights + Sales Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesForecast />
        </div>
        <div>
          <SmartInsights />
        </div>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <div>
          <TopProductsList />
        </div>
      </div>

      {/* Recent Sales */}
      <RecentSalesTable />
    </div>
  );
};

export default Dashboard;
