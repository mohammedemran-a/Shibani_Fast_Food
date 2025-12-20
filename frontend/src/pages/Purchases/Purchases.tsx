import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Eye, FileDown, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
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
import { purchaseService } from '@/api/purchaseService';

const Purchases: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const queryClient = useQueryClient();

  // جلب فواتير المشتريات من API
  const { data: purchasesData, isLoading } = useQuery({
    queryKey: ['purchases', { search: searchQuery, from_date: fromDate, to_date: toDate }],
    queryFn: () => purchaseService.getPurchases({
      search: searchQuery,
      from_date: fromDate,
      to_date: toDate,
    }),
  });

  // حذف فاتورة
  const deleteMutation = useMutation({
    mutationFn: (id: number) => purchaseService.deletePurchase(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      toast.success('تم حذف الفاتورة بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل حذف الفاتورة');
    },
  });

  const purchases = purchasesData?.data?.data || [];

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-success/10 text-success',
      pending: 'bg-warning/10 text-warning',
      cancelled: 'bg-destructive/10 text-destructive',
    };
    const labels = {
      completed: 'مكتمل',
      pending: 'معلق',
      cancelled: 'ملغي',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const filteredPurchases = purchases.filter((p: any) => 
    p.supplier?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('nav.purchases')}</h1>
          <p className="text-muted-foreground mt-1">إدارة فواتير المشتريات</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <FileDown className="w-4 h-4" />
            {t('products.export')}
          </Button>
          <Link to="/purchases/add">
            <Button className="gradient-primary border-0 gap-2">
              <Plus className="w-4 h-4" />
              إضافة فاتورة
            </Button>
          </Link>
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder={t('common.search')} 
              className="ps-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Input 
            type="date" 
            placeholder="من تاريخ"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <Input 
            type="date" 
            placeholder="إلى تاريخ"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">رقم الفاتورة</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">المورد</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">التاريخ</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">عدد العناصر</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">المجموع الفرعي</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">الضريبة</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">الخصم</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">الإجمالي</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">الحالة</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-muted-foreground">
                    جاري التحميل...
                  </td>
                </tr>
              ) : filteredPurchases.length > 0 ? (
                filteredPurchases.map((purchase: any, index: number) => (
                  <motion.tr
                    key={purchase.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-t border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 px-4 font-mono text-primary">{purchase.invoice_number}</td>
                    <td className="py-4 px-4 font-medium text-foreground">{purchase.supplier?.name || 'N/A'}</td>
                    <td className="py-4 px-4 text-muted-foreground">
                      {new Date(purchase.invoice_date).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">{purchase.items?.length || 0}</td>
                    <td className="py-4 px-4 text-muted-foreground">${Number(purchase.subtotal || 0).toFixed(2)}</td>
                    <td className="py-4 px-4 text-muted-foreground">${Number(purchase.tax_amount || 0).toFixed(2)}</td>
                    <td className="py-4 px-4 text-muted-foreground">${Number(purchase.discount_amount || 0).toFixed(2)}</td>
                    <td className="py-4 px-4 font-semibold text-accent">${Number(purchase.total_amount || 0).toFixed(2)}</td>
                    <td className="py-4 px-4">{getStatusBadge(purchase.status)}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1">
                        <Link to={`/purchases/${purchase.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-destructive" />
                                {t('common.warning')}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                هل أنت متأكد من حذف هذه الفاتورة؟
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(purchase.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {t('common.delete')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-muted-foreground">
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

export default Purchases;
