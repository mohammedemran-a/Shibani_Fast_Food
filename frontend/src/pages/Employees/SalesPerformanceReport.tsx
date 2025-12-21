import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, TrendingUp, DollarSign, Award, BarChart3, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';
import { salesPerformanceService, type SalesPerformance } from '@/api/salesPerformanceService';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const SalesPerformanceReport: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useTheme();
  
  const [dateRange] = useState({
    start_date: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end_date: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });

  // Fetch all users performance
  const { data: performanceResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['sales-performance', dateRange],
    queryFn: () => salesPerformanceService.getAll(dateRange),
  });

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-warning/10 text-warning';
    if (rank === 2) return 'bg-muted text-muted-foreground';
    if (rank === 3) return 'bg-orange-500/10 text-orange-500';
    return 'bg-muted/50 text-muted-foreground';
  };

  const performanceData = performanceResponse?.data || [];
  
  // Add rank to performance data
  const rankedData = performanceData.map((item: SalesPerformance, index: number) => ({
    ...item,
    rank: index + 1,
  }));

  // Prepare chart data
  const chartData = rankedData.slice(0, 10).map((p: SalesPerformance & { rank: number }) => ({
    name: p.user_name,
    sales: p.total_sales,
  }));

  // Calculate totals
  const totals = {
    totalSales: performanceData.reduce((sum: number, p: SalesPerformance) => sum + p.total_sales, 0),
    totalInvoices: performanceData.reduce((sum: number, p: SalesPerformance) => sum + p.total_invoices, 0),
    topPerformer: rankedData[0]?.user_name || '-',
    activeCashiers: performanceData.length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            تقرير أداء المبيعات
          </h1>
          <p className="text-muted-foreground mt-1">متابعة أداء الموظفين في المبيعات</p>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <Card className="glass-card">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive">حدث خطأ أثناء تحميل تقرير الأداء</p>
            <Button variant="outline" onClick={() => refetch()} className="mt-4">
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {totals.totalSales.toLocaleString('ar-SA', { 
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2 
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">إجمالي المبيعات</p>
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
                    <p className="text-2xl font-bold text-foreground">{totals.totalInvoices}</p>
                    <p className="text-xs text-muted-foreground">إجمالي الفواتير</p>
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
                    <p className="text-xl font-bold text-foreground truncate">{totals.topPerformer}</p>
                    <p className="text-xs text-muted-foreground">الأفضل أداءً</p>
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
                    <p className="text-2xl font-bold text-foreground">{totals.activeCashiers}</p>
                    <p className="text-xs text-muted-foreground">الموظفين النشطين</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {chartData.length > 0 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>المبيعات حسب الموظف</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      <YAxis dataKey="name" type="category" width={100} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="المبيعات" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>التقرير التفصيلي</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-center py-4 px-4 font-medium text-muted-foreground">الترتيب</th>
                      <th className="text-start py-4 px-4 font-medium text-muted-foreground">الموظف</th>
                      <th className="text-center py-4 px-4 font-medium text-muted-foreground">إجمالي المبيعات</th>
                      <th className="text-center py-4 px-4 font-medium text-muted-foreground">عدد الفواتير</th>
                      <th className="text-center py-4 px-4 font-medium text-muted-foreground">متوسط الفاتورة</th>
                      <th className="text-center py-4 px-4 font-medium text-muted-foreground">هامش الربح</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankedData.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-muted-foreground">
                          لا توجد بيانات أداء
                        </td>
                      </tr>
                    ) : (
                      rankedData.map((employee: SalesPerformance & { rank: number }, index: number) => (
                        <motion.tr
                          key={employee.user_id}
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
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium text-foreground">{employee.user_name}</p>
                              <p className="text-xs text-muted-foreground">{employee.role_name}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center text-primary font-semibold">
                            {employee.total_sales.toLocaleString('ar-SA', { 
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2 
                            })}
                          </td>
                          <td className="py-4 px-4 text-center text-muted-foreground">
                            {employee.total_invoices}
                          </td>
                          <td className="py-4 px-4 text-center text-success font-semibold">
                            {employee.average_invoice_value.toLocaleString('ar-SA', { 
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2 
                            })}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                              {employee.profit_margin.toFixed(1)}%
                            </span>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default SalesPerformanceReport;
