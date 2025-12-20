import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Eye, FileDown, Trash2, AlertTriangle, Printer } from 'lucide-react';
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
import { salesService } from '@/api/salesService';
import { printInvoice } from '@/utils/printService';
import PageErrorBoundary from '@/components/PageErrorBoundary';

const SalesContent: React.FC = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const queryClient = useQueryClient();

  // Fetch sales invoices from API
  const { data: salesData, isLoading, error } = useQuery({
    queryKey: ['sales', fromDate, toDate, search],
    queryFn: () => salesService.getSalesInvoices({ 
      from_date: fromDate, 
      to_date: toDate,
      search 
    }),
  });

  // Delete sales invoice mutation
  const deleteMutation = useMutation({
    mutationFn: salesService.deleteSalesInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast.success('Invoice deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete invoice');
    },
  });

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
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const handleDeleteSingle = (id: number) => {
    deleteMutation.mutate(id);
  };

  const sales = salesData?.data?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading sales</p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['sales'] })}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('sales.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('sales.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <FileDown className="w-4 h-4" />
            {t('products.export')}
          </Button>
          <Link to="/pos">
            <Button className="gradient-primary border-0 gap-2">
              <Plus className="w-4 h-4" />
              {t('sales.newInvoice')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder={t('common.search')} 
              className="ps-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Input 
            type="date" 
            placeholder="From Date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <Input 
            type="date" 
            placeholder="To Date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
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
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('common.status')}</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale: any, index: number) => (
                <motion.tr
                  key={sale.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-t border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="py-4 px-4 font-medium text-foreground">{sale.invoice_number}</td>
                  <td className="py-4 px-4 text-muted-foreground">{sale.customer?.name || 'Walk-in Customer'}</td>
                  <td className="py-4 px-4 text-muted-foreground">{new Date(sale.created_at).toLocaleDateString()}</td>
                  <td className="py-4 px-4 text-muted-foreground">{sale.items?.length || 0}</td>
                  <td className="py-4 px-4 font-semibold text-primary">${Number(sale.total_amount || 0).toFixed(2)}</td>
                  <td className="py-4 px-4">{getStatusBadge(sale.status)}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => {
                          // طباعة الفاتورة
                          printInvoice({
                            invoice_number: sale.invoice_number,
                            invoice_date: sale.created_at,
                            customer_name: sale.customer?.name,
                            items: sale.items?.map((item: any) => ({
                              product_name: item.product?.name || 'منتج',
                              quantity: item.quantity,
                              unit_price: parseFloat(item.unit_price),
                              total_price: parseFloat(item.total_price),
                            })) || [],
                            subtotal: parseFloat(sale.subtotal || 0),
                            tax_amount: parseFloat(sale.tax_amount || 0),
                            discount_amount: parseFloat(sale.discount_amount || 0),
                            total_amount: parseFloat(sale.total_amount || 0),
                            payment_method: sale.payment_method,
                            notes: sale.notes,
                          });
                        }}
                        title="طباعة الفاتورة"
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="w-4 h-4" />
                      </Button>
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
                              Are you sure you want to delete this invoice?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteSingle(sale.id)} 
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {t('common.confirm')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {sales.length === 0 && (
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

const Sales: React.FC = () => {
  return (
    <PageErrorBoundary pageName="المبيعات">
      <SalesContent />
    </PageErrorBoundary>
  );
};

export default Sales;
