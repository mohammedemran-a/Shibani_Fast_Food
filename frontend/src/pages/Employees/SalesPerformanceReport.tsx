import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Users, TrendingUp, DollarSign, Award, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangeFilter } from '@/components/reports/DateRangeFilter';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';

interface SalesPerformance {
  id: number;
  name: string;
  totalSales: number;
  transactions: number;
  avgTransaction: number;
  rank: number;
}

const performanceData: SalesPerformance[] = [
  { id: 1, name: 'أحمد محمد', totalSales: 12500, transactions: 156, avgTransaction: 80.13, rank: 1 },
  { id: 2, name: 'سارة علي', totalSales: 10800, transactions: 142, avgTransaction: 76.06, rank: 2 },
  { id: 3, name: 'محمد خالد', totalSales: 9200, transactions: 128, avgTransaction: 71.88, rank: 3 },
  { id: 4, name: 'فاطمة أحمد', totalSales: 8500, transactions: 115, avgTransaction: 73.91, rank: 4 },
  { id: 5, name: 'عمر حسن', totalSales: 7800, transactions: 98, avgTransaction: 79.59, rank: 5 },
];

const chartData = performanceData.map(p => ({
  name: p.name,
  sales: p.totalSales,
}));

const SalesPerformanceReport: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useTheme();

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-warning/10 text-warning';
    if (rank === 2) return 'bg-muted text-muted-foreground';
    if (rank === 3) return 'bg-orange-500/10 text-orange-500';
    return 'bg-muted/50 text-muted-foreground';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            {t('salesPerformance.title')}
          </h1>
          <p className="text-muted-foreground mt-1">{t('salesPerformance.subtitle')}</p>
        </div>
        <DateRangeFilter />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">$48,800</p>
                <p className="text-xs text-muted-foreground">{t('salesPerformance.totalSales')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">639</p>
                <p className="text-xs text-muted-foreground">{t('salesPerformance.totalTransactions')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">أحمد محمد</p>
                <p className="text-xs text-muted-foreground">{t('salesPerformance.topPerformer')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">5</p>
                <p className="text-xs text-muted-foreground">{t('salesPerformance.activeCashiers')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>{t('salesPerformance.salesByEmployee')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  type="number" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar 
                  dataKey="sales" 
                  fill="hsl(var(--primary))" 
                  radius={[0, 4, 4, 0]}
                  name={t('salesPerformance.sales')}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Performance Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>{t('salesPerformance.detailedReport')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-center py-4 px-4 font-medium text-muted-foreground">{t('salesPerformance.rank')}</th>
                  <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('salesPerformance.employee')}</th>
                  <th className="text-center py-4 px-4 font-medium text-muted-foreground">{t('salesPerformance.totalSales')}</th>
                  <th className="text-center py-4 px-4 font-medium text-muted-foreground">{t('salesPerformance.transactions')}</th>
                  <th className="text-center py-4 px-4 font-medium text-muted-foreground">{t('salesPerformance.avgTransaction')}</th>
                </tr>
              </thead>
              <tbody>
                {performanceData.map((employee, index) => (
                  <motion.tr
                    key={employee.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-t border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 px-4 text-center">
                      <span className={`w-8 h-8 inline-flex items-center justify-center rounded-full font-bold ${getRankBadge(employee.rank)}`}>
                        {employee.rank}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-medium text-foreground">{employee.name}</td>
                    <td className="py-4 px-4 text-center text-primary font-semibold">${employee.totalSales.toLocaleString()}</td>
                    <td className="py-4 px-4 text-center text-muted-foreground">{employee.transactions}</td>
                    <td className="py-4 px-4 text-center text-success font-semibold">${employee.avgTransaction.toFixed(2)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesPerformanceReport;