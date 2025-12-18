import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

const recentSales = [
  { id: 1, customer: 'أحمد محمد', amount: 250.00, items: 3, time: 'منذ 5 دقائق' },
  { id: 2, customer: 'سارة علي', amount: 180.50, items: 2, time: 'منذ 12 دقيقة' },
  { id: 3, customer: 'محمد خالد', amount: 420.00, items: 5, time: 'منذ 25 دقيقة' },
  { id: 4, customer: 'فاطمة أحمد', amount: 95.00, items: 1, time: 'منذ 45 دقيقة' },
  { id: 5, customer: 'عمر حسن', amount: 310.75, items: 4, time: 'منذ ساعة' },
];

export const RecentSalesTable: React.FC = () => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="glass-card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          {t('dashboard.recentSales')}
        </h3>
        <Button variant="ghost" size="sm" className="text-primary">
          {t('common.viewAll')}
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-start py-3 px-2 text-sm font-medium text-muted-foreground">
                {t('pos.customer')}
              </th>
              <th className="text-start py-3 px-2 text-sm font-medium text-muted-foreground">
                {t('products.quantity')}
              </th>
              <th className="text-start py-3 px-2 text-sm font-medium text-muted-foreground">
                {t('pos.total')}
              </th>
              <th className="text-start py-3 px-2 text-sm font-medium text-muted-foreground">
                الوقت
              </th>
              <th className="text-start py-3 px-2 text-sm font-medium text-muted-foreground">
                {t('common.actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {recentSales.map((sale, index) => (
              <motion.tr
                key={sale.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="border-b border-border/50 hover:bg-muted/30 transition-colors"
              >
                <td className="py-3 px-2">
                  <span className="font-medium text-foreground">{sale.customer}</span>
                </td>
                <td className="py-3 px-2">
                  <span className="text-muted-foreground">{sale.items} منتجات</span>
                </td>
                <td className="py-3 px-2">
                  <span className="font-semibold text-success">${sale.amount.toFixed(2)}</span>
                </td>
                <td className="py-3 px-2">
                  <span className="text-muted-foreground text-sm">{sale.time}</span>
                </td>
                <td className="py-3 px-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Eye className="w-4 h-4" />
                  </Button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
