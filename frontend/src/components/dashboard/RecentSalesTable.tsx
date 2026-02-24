import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

// تعريف أنواع البيانات للوضوح
interface Sale {
  id: number;
  invoice_number: string;
  customer: { id: number; name: string } | null;
  total_amount: string | number; // قد يأتي كنص أو رقم
  status: string;
  invoice_date: string;
}

interface RecentSalesTableProps {
  data: Sale[];
  isLoading: boolean;
}

export const RecentSalesTable: React.FC<RecentSalesTableProps> = ({ data, isLoading }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-9 w-20" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-6 w-1/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

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
        <Button variant="ghost" size="sm" className="text-primary" onClick={() => navigate('/sales/invoices')}>
          {t('common.viewAll')}
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-start py-3 px-2 text-sm font-medium text-muted-foreground">{t('pos.customer')}</th>
              <th className="text-start py-3 px-2 text-sm font-medium text-muted-foreground">{t('pos.total')}</th>
              <th className="text-start py-3 px-2 text-sm font-medium text-muted-foreground">الوقت</th>
              <th className="text-start py-3 px-2 text-sm font-medium text-muted-foreground">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((sale, index) => (
              <motion.tr
                key={sale.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="border-b border-border/50 hover:bg-muted/30 transition-colors"
              >
                <td className="py-3 px-2">
                  <span className="font-medium text-foreground">{sale.customer?.name || t('common.guest')}</span>
                </td>
                <td className="py-3 px-2">
                  {/* ================================================================= */}
                  {/* **تم التصحيح هنا: تحويل القيمة إلى رقم قبل استخدام toFixed** */}
                  {/* ================================================================= */}
                  <span className="font-semibold text-success">{Number(sale.total_amount).toFixed(2)} ريال</span>
                </td>
                <td className="py-3 px-2">
                  <span className="text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(sale.invoice_date), { addSuffix: true, locale: ar })}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/sales/invoices/${sale.id}`)}>
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
