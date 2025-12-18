import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';

const data = [
  { name: 'يناير', sales: 4000, purchases: 2400 },
  { name: 'فبراير', sales: 3000, purchases: 1398 },
  { name: 'مارس', sales: 2000, purchases: 9800 },
  { name: 'أبريل', sales: 2780, purchases: 3908 },
  { name: 'مايو', sales: 1890, purchases: 4800 },
  { name: 'يونيو', sales: 2390, purchases: 3800 },
  { name: 'يوليو', sales: 3490, purchases: 4300 },
];

export const SalesChart: React.FC = () => {
  const { t } = useTranslation();
  const { theme, isRTL } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="glass-card p-5"
    >
      <h3 className="text-lg font-semibold text-foreground mb-4">
        {t('dashboard.salesChart')}
      </h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(215, 90%, 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(215, 90%, 45%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(32, 95%, 55%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(32, 95%, 55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="name"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              reversed={isRTL}
            />
            <YAxis
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              orientation={isRTL ? 'right' : 'left'}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 12px hsl(var(--foreground) / 0.1)',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="hsl(215, 90%, 45%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSales)"
              name={t('dashboard.totalSales')}
            />
            <Area
              type="monotone"
              dataKey="purchases"
              stroke="hsl(32, 95%, 55%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPurchases)"
              name={t('dashboard.totalPurchases')}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
