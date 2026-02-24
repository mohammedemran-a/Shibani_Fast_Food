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
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// 1. تعريف واجهة للبيانات القادمة من الـ API
interface ChartDataPoint {
  date: string;
  total_sales: number;
}

// 2. تعريف واجهة للـ Props التي سيستقبلها المكون
interface SalesChartProps {
  data: ChartDataPoint[];
  isLoading: boolean;
}

// 3. المكون الآن يستقبل `data` و `isLoading` كـ props
export const SalesChart: React.FC<SalesChartProps> = ({ data, isLoading }) => {
  const { t } = useTranslation();
  const { isRTL } = useTheme();

  // 4. عرض هيكل التحميل (Skeleton) أثناء جلب البيانات
  if (isLoading) {
    return (
      <Card className="glass-card p-5">
        <Skeleton className="h-6 w-1/3 mb-4" />
        <Skeleton className="h-[300px] w-full" />
      </Card>
    );
  }

  // 5. تنسيق البيانات لتكون مناسبة للعرض في الرسم البياني
  const formattedData = data.map(item => ({
    // تنسيق التاريخ ليكون أكثر قابلية للقراءة (مثال: 23 فبراير)
    name: new Date(item.date).toLocaleDateString('ar-EG', {
      month: 'short',
      day: 'numeric',
    }),
    sales: item.total_sales,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="glass-card p-5"
    >
      <h3 className="text-lg font-semibold text-foreground mb-4">
        {/* استخدام مفتاح ترجمة مناسب */}
        {t('reports.salesSummary')}
      </h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
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
              // تنسيق الأرقام على المحور Y لتكون أكثر قابلية للقراءة
              tickFormatter={(value) => new Intl.NumberFormat('ar-EG').format(value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              // تنسيق القيمة داخل الـ Tooltip
              formatter={(value: number) => [`${value.toLocaleString()} ريال`, t('dashboard.totalSales')]}
            />
            <Area
              type="monotone"
              dataKey="sales" // 6. التركيز على عرض المبيعات فقط
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSales)"
              name={t('dashboard.totalSales')}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
