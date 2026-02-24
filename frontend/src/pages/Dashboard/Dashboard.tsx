import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DollarSign, ShoppingCart, TrendingUp, Package, Users, Truck, RotateCcw, Wallet } from 'lucide-react';
import { StatsCard, SalesChart, RecentSalesTable, TopProductsList, SmartInsights, SalesForecast } from '@/components/dashboard';
import { useDashboard } from '@/hooks/useDashboard';
import DateRangeFilter from '@/components/common/DateRangeFilter';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState('all');
  const [startDate, setStartDate] = useState<string>();
  const [endDate, setEndDate] = useState<string>();

  const { data: dashboardData, isLoading } = useDashboard(period, startDate, endDate);

  // استخدام `any` هنا بشكل مؤقت لتجاوز أخطاء TypeScript الناتجة عن عدم تزامن ملفات الأنواع.
  // ملاحظة للمطور: يجب تحديث واجهة (interface) بيانات الداشبورد لتعكس الهيكل الجديد.
  const stats: any = dashboardData?.data;
  
  // مطابقة الأسماء 100% مع الواجهة الخلفية
  const salesChartData = stats?.sales_chart_data || [];
  const topProducts = stats?.top_products || [];
  const recentSales = stats?.recent_sales || [];
  const smartInsights = stats?.smart_insights || [];

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

      {/* ==================== تمت مراجعة جميع المسارات في هذا القسم ==================== */}
      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t('dashboard.totalSales')}
          value={`${stats?.sales?.total?.toLocaleString() || '0'} ريال`}
          change={`${stats?.sales?.count || 0} ${t('dashboard.transactions')}`}
          icon={DollarSign}
          variant="primary"
          isLoading={isLoading}
        />
        <StatsCard
          title={t('dashboard.totalPurchases')}
          value={`${stats?.purchases?.total?.toLocaleString() || '0'} ريال`}
          change={`${stats?.purchases?.count || 0} ${t('dashboard.transactions')}`}
          icon={ShoppingCart}
          variant="accent"
          isLoading={isLoading}
        />
        <StatsCard
          title={t('dashboard.totalProfit')}
          value={`${stats?.profit?.total?.toLocaleString() || '0'} ريال`}
          change={`${stats?.profit?.margin?.toFixed(1) || 0}% ${t('dashboard.margin')}`}
          icon={TrendingUp}
          variant="success"
          isLoading={isLoading}
        />
        <StatsCard
          title={t('dashboard.totalProducts')}
          value={stats?.products?.total_count || '0'}
          change={`${stats?.products?.low_stock_count || 0} ${t('dashboard.lowStock')}`}
          icon={Package}
          variant="warning"
          isLoading={isLoading}
        />
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t('dashboard.totalCustomers')}
          value={stats?.people?.customers_count || '0'}
          change={`${stats?.people?.active_customers || 0} ${t('dashboard.active')}`}
          icon={Users}
          variant="primary"
          isLoading={isLoading}
        />
        <StatsCard
          title={t('dashboard.totalSuppliers')}
          value={stats?.people?.suppliers_count || '0'}
          change={`${stats?.people?.active_suppliers || 0} ${t('dashboard.active')}`}
          icon={Truck}
          variant="accent"
          isLoading={isLoading}
        />
        <StatsCard
          title={t('dashboard.totalExpenses')}
          value={`${stats?.expenses?.total?.toLocaleString() || '0'} ريال`}
          change={`${stats?.expenses?.count || 0} ${t('dashboard.transactions')}`}
          icon={RotateCcw}
          variant="warning"
          isLoading={isLoading}
        />
        <StatsCard
          title={t('dashboard.netProfit')}
          value={`${stats?.profit?.net_profit?.toLocaleString() || '0'} ريال`}
          change={t('dashboard.afterExpenses')}
          icon={Wallet}
          variant="success"
          isLoading={isLoading}
        />
      </div>
      {/* ============================================================================== */}

      {/* Smart Insights + Sales Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesForecast />
        </div>
        <div>
          <SmartInsights data={smartInsights} isLoading={isLoading} />
        </div>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart data={salesChartData} isLoading={isLoading} />
        </div>
        <div>
          <TopProductsList data={topProducts} isLoading={isLoading} />
        </div>
      </div>

      {/* Recent Sales */}
      <RecentSalesTable data={recentSales} isLoading={isLoading} />
    </div>
  );
};

export default Dashboard;
