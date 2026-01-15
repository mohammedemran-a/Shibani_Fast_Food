import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DollarSign, ShoppingCart, TrendingUp, Package, Users, Truck, RotateCcw, Wallet } from 'lucide-react';
import { StatsCard, SalesChart, RecentSalesTable, TopProductsList, SmartInsights, SalesForecast } from '@/components/dashboard';
import { useDashboard } from '@/hooks/useDashboard';
import { useLowStockProducts } from '@/hooks/useProducts';
import DateRangeFilter from '@/components/common/DateRangeFilter';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState('all');
  const [startDate, setStartDate] = useState<string>();
  const [endDate, setEndDate] = useState<string>();

  // Fetch dashboard statistics with caching (5 minutes)
  const { data: stats, isLoading } = useDashboard(period, startDate, endDate);

  // Fetch low stock products with caching (2 minutes)
  const { data: lowStockData } = useLowStockProducts();

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {t('dashboard.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('dashboard.welcome')}! {t('dashboard.overview')}
          </p>
        </div>
        <div className="w-full md:w-auto">
          <DateRangeFilter
            period={period}
            onPeriodChange={setPeriod}
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t('dashboard.totalSales')}
          value={`${stats?.data?.sales?.total?.toLocaleString() || '0'} ريال`}
          change={`${stats?.data?.sales?.count || 0} ${t('dashboard.transactions')}`}
          changeType="positive"
          icon={DollarSign}
          variant="primary"
        />
        <StatsCard
          title={t('dashboard.totalPurchases')}
          value={`${stats?.data?.purchases?.total?.toLocaleString() || '0'} ريال`}
          change={`${stats?.data?.purchases?.count || 0} ${t('dashboard.transactions')}`}
          changeType="positive"
          icon={ShoppingCart}
          variant="accent"
        />
        <StatsCard
          title={t('dashboard.totalProfit')}
          value={`${stats?.data?.profit?.total?.toLocaleString() || '0'} ريال`}
          change={`${stats?.data?.profit?.margin?.toFixed(1) || 0}% ${t('dashboard.margin')}`}
          changeType="positive"
          icon={TrendingUp}
          variant="success"
        />
        <StatsCard
          title={t('dashboard.totalProducts')}
          value={stats?.data?.products?.total_count || '0'}
          change={`${stats?.data?.products?.low_stock_count || 0} ${t('dashboard.lowStock')}`}
          changeType="warning"
          icon={Package}
          variant="warning"
        />
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t('dashboard.totalCustomers')}
          value={stats?.data?.people?.customers_count || '0'}
          change={`${stats?.data?.people?.active_customers || 0} ${t('dashboard.active')}`}
          changeType="positive"
          icon={Users}
          variant="primary"
        />
        <StatsCard
          title={t('dashboard.totalSuppliers')}
          value={stats?.data?.people?.suppliers_count || '0'}
          change={t('dashboard.active')}
          changeType="positive"
          icon={Truck}
          variant="accent"
        />
        <StatsCard
          title={t('dashboard.totalExpenses')}
          value={`${stats?.data?.expenses?.total?.toLocaleString() || '0'} ريال`}
          change={`${stats?.data?.expenses?.count || 0} ${t('dashboard.transactions')}`}
          changeType="neutral"
          icon={RotateCcw}
          variant="warning"
        />
        <StatsCard
          title={t('dashboard.netProfit')}
          value={`${stats?.data?.profit?.total?.toLocaleString() || '0'} ريال`}
          change={t('dashboard.afterExpenses')}
          changeType="positive"
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
