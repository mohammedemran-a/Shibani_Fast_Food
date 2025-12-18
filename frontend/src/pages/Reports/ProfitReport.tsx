import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DateRangeFilter } from '@/components/reports/DateRangeFilter';
import { useTheme } from '@/contexts/ThemeContext';

const profitData = [
  { name: 'يناير', revenue: 12000, cost: 8000, profit: 4000 },
  { name: 'فبراير', revenue: 15000, cost: 9000, profit: 6000 },
  { name: 'مارس', revenue: 13000, cost: 8500, profit: 4500 },
  { name: 'أبريل', revenue: 18000, cost: 11000, profit: 7000 },
  { name: 'مايو', revenue: 16000, cost: 10000, profit: 6000 },
  { name: 'يونيو', revenue: 20000, cost: 12000, profit: 8000 },
];

const ProfitReport: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useTheme();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('nav.profitReport')}</h1>
          <p className="text-muted-foreground mt-1">تحليل الأرباح والإيرادات</p>
        </div>
        <DateRangeFilter />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card bg-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">{t('reports.revenue')}</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">$94,000</h3>
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
              <p className="text-muted-foreground text-sm">{t('reports.expenses')}</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">$58,500</h3>
              <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                <TrendingDown className="w-3 h-3" /> +8.2%
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-destructive flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6 text-destructive-foreground" />
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
              <p className="text-muted-foreground text-sm">{t('reports.profit')}</p>
              <h3 className="text-2xl font-bold text-success mt-1">$35,500</h3>
              <p className="text-sm text-success flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> +18.3%
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl gradient-success flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-success-foreground" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-5"
      >
        <h3 className="font-semibold text-foreground text-lg mb-4">تحليل الأرباح الشهرية</h3>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={profitData}>
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
              <Bar dataKey="revenue" fill="hsl(215, 90%, 45%)" radius={[4, 4, 0, 0]} name={t('reports.revenue')} />
              <Bar dataKey="cost" fill="hsl(32, 95%, 55%)" radius={[4, 4, 0, 0]} name={t('reports.expenses')} />
              <Bar dataKey="profit" fill="hsl(145, 70%, 40%)" radius={[4, 4, 0, 0]} name={t('reports.profit')} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfitReport;
