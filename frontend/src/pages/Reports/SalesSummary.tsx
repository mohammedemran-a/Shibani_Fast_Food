import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, ShoppingBag, Users, FileDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DateRangeFilter } from '@/components/reports/DateRangeFilter';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';

const salesData = [
  { name: 'السبت', sales: 2400 },
  { name: 'الأحد', sales: 1398 },
  { name: 'الاثنين', sales: 3800 },
  { name: 'الثلاثاء', sales: 3908 },
  { name: 'الأربعاء', sales: 4800 },
  { name: 'الخميس', sales: 3800 },
  { name: 'الجمعة', sales: 4300 },
];

const topSellingProducts = [
  { name: 'قهوة عربية', sold: 150, revenue: 450 },
  { name: 'شاي أخضر', sold: 120, revenue: 240 },
  { name: 'عصير برتقال', sold: 100, revenue: 350 },
  { name: 'ماء معدني', sold: 90, revenue: 90 },
  { name: 'بسكويت شوكولاتة', sold: 85, revenue: 170 },
];

const SalesSummary: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useTheme();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('reports.salesSummary')}</h1>
          <p className="text-muted-foreground mt-1">{t('reports.salesSummaryDesc')}</p>
        </div>
        <div className="flex gap-2">
          <DateRangeFilter />
          <Button variant="outline" className="gap-2">
            <FileDown className="w-4 h-4" />
            {t('products.export')}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card bg-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">{t('reports.totalRevenue')}</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">$24,406</h3>
              <p className="text-sm text-success flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> +12.5%
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card bg-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">{t('reports.ordersCount')}</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">385</h3>
              <p className="text-sm text-success flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> +8.2%
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-accent-foreground" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="stat-card bg-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">{t('reports.avgOrderValue')}</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">$63.40</h3>
              <p className="text-sm text-success flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> +4.1%
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl gradient-success flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-success-foreground" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="stat-card bg-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">{t('reports.uniqueCustomers')}</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">142</h3>
              <p className="text-sm text-success flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> +15.3%
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-warning flex items-center justify-center">
              <Users className="w-6 h-6 text-warning-foreground" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-5"
      >
        <h3 className="font-semibold text-foreground text-lg mb-4">{t('reports.weeklySales')}</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="colorSalesSummary" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(215, 90%, 45%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(215, 90%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} reversed={isRTL} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} orientation={isRTL ? 'right' : 'left'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="hsl(215, 90%, 45%)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorSalesSummary)"
                name={t('dashboard.totalSales')}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Top Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-5"
      >
        <h3 className="font-semibold text-foreground text-lg mb-4">{t('reports.topSellingProducts')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-start py-3 px-4 font-medium text-muted-foreground">{t('products.name')}</th>
                <th className="text-start py-3 px-4 font-medium text-muted-foreground">{t('reports.soldQuantity')}</th>
                <th className="text-start py-3 px-4 font-medium text-muted-foreground">{t('reports.revenue')}</th>
              </tr>
            </thead>
            <tbody>
              {topSellingProducts.map((product, index) => (
                <tr key={index} className="border-t border-border">
                  <td className="py-3 px-4 font-medium text-foreground">{product.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{product.sold}</td>
                  <td className="py-3 px-4 font-semibold text-success">${product.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default SalesSummary;
