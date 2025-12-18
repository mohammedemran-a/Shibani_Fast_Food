import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ShoppingCart, TrendingUp, Package, FileDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DateRangeFilter } from '@/components/reports/DateRangeFilter';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';

const purchasesData = [
  { name: 'يناير', amount: 8000 },
  { name: 'فبراير', amount: 9500 },
  { name: 'مارس', amount: 7200 },
  { name: 'أبريل', amount: 11000 },
  { name: 'مايو', amount: 9800 },
  { name: 'يونيو', amount: 12500 },
];

const supplierData = [
  { name: 'شركة الأغذية المتحدة', value: 35 },
  { name: 'مصنع المشروبات الوطني', value: 25 },
  { name: 'شركة الألبان الطازجة', value: 20 },
  { name: 'موردين آخرين', value: 20 },
];

const COLORS = ['hsl(215, 90%, 45%)', 'hsl(32, 95%, 55%)', 'hsl(145, 70%, 40%)', 'hsl(220, 15%, 60%)'];

const PurchasesReport: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useTheme();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('reports.purchasesReport')}</h1>
          <p className="text-muted-foreground mt-1">{t('reports.purchasesReportDesc')}</p>
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card bg-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">{t('reports.totalPurchases')}</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">$58,000</h3>
              <p className="text-sm text-success flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> +8.5%
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-accent-foreground" />
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
              <p className="text-muted-foreground text-sm">{t('reports.invoicesCount')}</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">145</h3>
              <p className="text-sm text-muted-foreground mt-1">{t('reports.thisPeriod')}</p>
            </div>
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Package className="w-6 h-6 text-primary-foreground" />
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
              <p className="text-muted-foreground text-sm">{t('reports.avgInvoice')}</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">$400</h3>
              <p className="text-sm text-muted-foreground mt-1">{t('reports.perInvoice')}</p>
            </div>
            <div className="w-12 h-12 rounded-xl gradient-success flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-success-foreground" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-5"
        >
          <h3 className="font-semibold text-foreground text-lg mb-4">{t('reports.monthlyPurchases')}</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={purchasesData}>
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
                <Bar dataKey="amount" fill="hsl(32, 95%, 55%)" radius={[4, 4, 0, 0]} name={t('reports.amount')} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-5"
        >
          <h3 className="font-semibold text-foreground text-lg mb-4">{t('reports.purchasesBySupplier')}</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={supplierData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {supplierData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PurchasesReport;
