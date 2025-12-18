import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ShoppingCart, Truck, Package, FileDown, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DateRangeFilter } from '@/components/reports/DateRangeFilter';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';

const purchasesData = [
  { name: 'السبت', amount: 1800 },
  { name: 'الأحد', amount: 2200 },
  { name: 'الاثنين', amount: 1500 },
  { name: 'الثلاثاء', amount: 2800 },
  { name: 'الأربعاء', amount: 2100 },
  { name: 'الخميس', amount: 1900 },
  { name: 'الجمعة', amount: 3200 },
];

const recentPurchases = [
  { id: 'PUR-001', supplier: 'شركة الأغذية المتحدة', date: '2024-01-15', amount: 1250.00 },
  { id: 'PUR-002', supplier: 'مصنع المشروبات الوطني', date: '2024-01-14', amount: 850.00 },
  { id: 'PUR-003', supplier: 'شركة الألبان الطازجة', date: '2024-01-13', amount: 2100.00 },
  { id: 'PUR-004', supplier: 'شركة الأغذية المتحدة', date: '2024-01-12', amount: 450.00 },
  { id: 'PUR-005', supplier: 'مصنع المشروبات الوطني', date: '2024-01-11', amount: 1800.00 },
];

const PurchasesSummary: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useTheme();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('reports.purchasesSummary')}</h1>
          <p className="text-muted-foreground mt-1">{t('reports.purchasesSummaryDesc')}</p>
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
              <p className="text-muted-foreground text-sm">{t('reports.weeklyPurchases')}</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">$15,500</h3>
              <p className="text-sm text-success flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> +5.2%
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
              <p className="text-muted-foreground text-sm">{t('reports.activeSuppliers')}</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">12</h3>
              <p className="text-sm text-muted-foreground mt-1">{t('reports.thisWeek')}</p>
            </div>
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Truck className="w-6 h-6 text-primary-foreground" />
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
              <p className="text-muted-foreground text-sm">{t('reports.productsReceived')}</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">856</h3>
              <p className="text-sm text-muted-foreground mt-1">{t('reports.units')}</p>
            </div>
            <div className="w-12 h-12 rounded-xl gradient-success flex items-center justify-center">
              <Package className="w-6 h-6 text-success-foreground" />
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
        <h3 className="font-semibold text-foreground text-lg mb-4">{t('reports.dailyPurchases')}</h3>
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

      {/* Recent Purchases Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-5"
      >
        <h3 className="font-semibold text-foreground text-lg mb-4">{t('reports.recentPurchases')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-start py-3 px-4 font-medium text-muted-foreground">{t('purchases.invoiceNumber')}</th>
                <th className="text-start py-3 px-4 font-medium text-muted-foreground">{t('purchases.supplier')}</th>
                <th className="text-start py-3 px-4 font-medium text-muted-foreground">{t('purchases.date')}</th>
                <th className="text-start py-3 px-4 font-medium text-muted-foreground">{t('reports.amount')}</th>
              </tr>
            </thead>
            <tbody>
              {recentPurchases.map((purchase, index) => (
                <tr key={index} className="border-t border-border">
                  <td className="py-3 px-4 font-mono text-primary">{purchase.id}</td>
                  <td className="py-3 px-4 font-medium text-foreground">{purchase.supplier}</td>
                  <td className="py-3 px-4 text-muted-foreground">{purchase.date}</td>
                  <td className="py-3 px-4 font-semibold text-accent">${purchase.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default PurchasesSummary;
