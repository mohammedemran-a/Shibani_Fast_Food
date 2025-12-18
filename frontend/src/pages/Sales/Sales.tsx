import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Eye, FileDown, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const initialSalesData = [
  { id: 'INV-001', customer: 'أحمد محمد', date: '2024-01-15', items: 3, total: 250.00, status: 'completed' },
  { id: 'INV-002', customer: 'سارة علي', date: '2024-01-15', items: 2, total: 180.50, status: 'completed' },
  { id: 'INV-003', customer: 'محمد خالد', date: '2024-01-14', items: 5, total: 420.00, status: 'pending' },
  { id: 'INV-004', customer: 'فاطمة أحمد', date: '2024-01-14', items: 1, total: 95.00, status: 'completed' },
  { id: 'INV-005', customer: 'عمر حسن', date: '2024-01-13', items: 4, total: 310.75, status: 'completed' },
];

const Sales: React.FC = () => {
  const { t } = useTranslation();
  const [salesData, setSalesData] = useState(initialSalesData);

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-success/10 text-success',
      pending: 'bg-warning/10 text-warning',
      cancelled: 'bg-destructive/10 text-destructive',
    };
    const labels = {
      completed: t('sales.completed'),
      pending: t('sales.pending'),
      cancelled: t('sales.cancelled'),
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const handleDeleteAll = () => {
    setSalesData([]);
    toast.success(t('sales.deleteAllSuccess'));
  };

  const handleDeleteSingle = (id: string) => {
    setSalesData(salesData.filter(s => s.id !== id));
    toast.success(t('common.delete'));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('sales.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('sales.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2" disabled={salesData.length === 0}>
                <Trash2 className="w-4 h-4" />
                {t('sales.deleteAll')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  {t('common.warning')}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t('sales.deleteAllConfirm')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {t('common.confirm')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="outline" className="gap-2">
            <FileDown className="w-4 h-4" />
            {t('products.export')}
          </Button>
          <Button className="gradient-primary border-0 gap-2">
            <Plus className="w-4 h-4" />
            {t('sales.newInvoice')}
          </Button>
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={t('common.search')} className="ps-10" />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            {t('products.filter')}
          </Button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('sales.invoiceNumber')}</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('sales.customer')}</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('sales.date')}</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('sales.items')}</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('sales.total')}</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('sales.status')}</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {salesData.map((sale, index) => (
                <motion.tr
                  key={sale.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-t border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="py-4 px-4 font-mono text-primary">{sale.id}</td>
                  <td className="py-4 px-4 font-medium text-foreground">{sale.customer}</td>
                  <td className="py-4 px-4 text-muted-foreground">{sale.date}</td>
                  <td className="py-4 px-4 text-muted-foreground">{sale.items}</td>
                  <td className="py-4 px-4 font-semibold text-success">${sale.total.toFixed(2)}</td>
                  <td className="py-4 px-4">{getStatusBadge(sale.status)}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteSingle(sale.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {salesData.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    {t('common.noData')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Sales;