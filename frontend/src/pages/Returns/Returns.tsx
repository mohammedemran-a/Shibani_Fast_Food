import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Eye, RotateCcw, Trash2, AlertTriangle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { purchaseReturnService } from '@/api/purchaseReturnService';
import PageErrorBoundary from '@/components/PageErrorBoundary';

const ReturnsContent: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();

  // جلب قائمة المرتجعات
  const { data: returnsData, isLoading: returnsLoading } = useQuery({
    queryKey: ['returns', { search: searchQuery }],
    queryFn: () => purchaseReturnService.getPurchaseReturns({ search: searchQuery }),
  });

  // جلب قائمة فواتير المشتريات
  const { data: invoicesData } = useQuery({
    queryKey: ['purchase-invoices-for-return'],
    queryFn: () => purchaseService.getPurchases({ status: 'completed' }),
  });

  // جلب عناصر الفاتورة المحددة
  const { data: invoiceItemsData, isLoading: itemsLoading } = useQuery({
    queryKey: ['invoice-items-for-return', selectedInvoiceId],
    queryFn: () => purchaseService.getItemsForReturn(selectedInvoiceId!),
    enabled: !!selectedInvoiceId,
  });

  // إنشاء مرتجع جديد
  const createMutation = useMutation({
    mutationFn: (data: any) => purchaseReturnService.createPurchaseReturn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      toast.success('تم إنشاء المرتجع بنجاح');
      setIsOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل إنشاء المرتجع');
    },
  });

  // حذف مرتجع
  const deleteMutation = useMutation({
    mutationFn: (id: number) => purchaseReturnService.deletePurchaseReturn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      toast.success('تم حذف المرتجع بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل حذف المرتجع');
    },
  });

  const returns = returnsData?.data?.data || [];
  const invoices = invoicesData?.data?.data || [];
  const invoiceItems = invoiceItemsData?.data?.items || [];
  const selectedItem = invoiceItems.find((item: any) => item.product_id === selectedProductId);

  const resetForm = () => {
    setSelectedInvoiceId(null);
    setSelectedProductId(null);
    setQuantity(1);
    setReason('');
    setNotes('');
  };

  const handleAdd = () => {
    if (!selectedInvoiceId || !selectedProductId) {
      toast.error('يرجى اختيار الفاتورة والمنتج');
      return;
    }

    if (!selectedItem) {
      toast.error('المنتج غير موجود');
      return;
    }

    if (quantity > selectedItem.available_return_quantity) {
      toast.error(`الكمية المتاحة للإرجاع هي ${selectedItem.available_return_quantity} فقط`);
      return;
    }

    createMutation.mutate({
      purchase_invoice_id: selectedInvoiceId,
      product_id: selectedProductId,
      quantity,
      reason,
      return_date: new Date().toISOString().split('T')[0],
      notes,
    });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      approved: 'bg-success/10 text-success',
      pending: 'bg-warning/10 text-warning',
      rejected: 'bg-destructive/10 text-destructive',
    };
    const labels = {
      approved: 'معتمد',
      pending: 'معلق',
      rejected: 'مرفوض',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const filteredReturns = returns.filter((r: any) =>
    r.return_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.product?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('nav.returns')}</h1>
          <p className="text-muted-foreground mt-1">إدارة مرتجعات المشتريات</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0 gap-2">
              <Plus className="w-4 h-4" />
              إضافة مرتجع
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إضافة مرتجع جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {/* اختيار الفاتورة */}
              <div className="space-y-2">
                <Label>فاتورة الشراء *</Label>
                <Select 
                  value={selectedInvoiceId?.toString()} 
                  onValueChange={(value) => {
                    setSelectedInvoiceId(Number(value));
                    setSelectedProductId(null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر فاتورة الشراء" />
                  </SelectTrigger>
                  <SelectContent>
                    {invoices.map((invoice: any) => (
                      <SelectItem key={invoice.id} value={invoice.id.toString()}>
                        {invoice.invoice_number} - {invoice.supplier?.name} - {new Date(invoice.invoice_date).toLocaleDateString('ar-SA')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* عرض المنتجات المتاحة */}
              {selectedInvoiceId && (
                <div className="space-y-2">
                  <Label>المنتج *</Label>
                  {itemsLoading ? (
                    <div className="text-center py-4 text-muted-foreground">جاري التحميل...</div>
                  ) : invoiceItems.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2">
                      {invoiceItems.map((item: any) => (
                        <div
                          key={item.product_id}
                          onClick={() => setSelectedProductId(item.product_id)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedProductId === item.product_id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium">{item.product_name}</p>
                              <div className="text-sm text-muted-foreground mt-1 space-y-1">
                                <p>الكمية الأصلية: {item.original_quantity}</p>
                                <p>الكمية المرتجعة: {item.returned_quantity}</p>
                                <p className="flex items-center gap-1">
                                  <span>الكمية المباعة:</span>
                                  <span className="text-destructive font-medium">{item.sold_quantity}</span>
                                  {item.sold_quantity > 0 && <AlertCircle className="w-3 h-3 text-destructive" />}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">المتاح للإرجاع</p>
                              <p className={`text-lg font-bold ${item.available_return_quantity > 0 ? 'text-success' : 'text-destructive'}`}>
                                {item.available_return_quantity}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      لا توجد منتجات متاحة للإرجاع في هذه الفاتورة
                    </div>
                  )}
                </div>
              )}

              {/* تفاصيل المرتجع */}
              {selectedProductId && selectedItem && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>الكمية *</Label>
                      <Input
                        type="number"
                        min="1"
                        max={selectedItem.available_return_quantity}
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                      />
                      <p className="text-xs text-muted-foreground">
                        الحد الأقصى: {selectedItem.available_return_quantity}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>المبلغ</Label>
                      <Input
                        type="text"
                        value={`${(quantity * selectedItem.unit_price).toFixed(2)} ريال`}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>سبب الإرجاع</Label>
                    <Input
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="مثال: منتج تالف، خطأ في الطلب، انتهاء الصلاحية"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>ملاحظات</Label>
                    <Input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="ملاحظات إضافية (اختياري)"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button 
                  onClick={handleAdd} 
                  className="gradient-primary border-0"
                  disabled={!selectedProductId || createMutation.isPending}
                >
                  {createMutation.isPending ? 'جاري الإضافة...' : t('common.add')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">رقم المرتجع</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">الفاتورة الأصلية</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">المنتج</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">الكمية</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">المبلغ</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">السبب</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">التاريخ</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">الحالة</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {returnsLoading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-muted-foreground">
                    جاري التحميل...
                  </td>
                </tr>
              ) : filteredReturns.length > 0 ? (
                filteredReturns.map((ret: any, index: number) => (
                  <motion.tr
                    key={ret.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-t border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <RotateCcw className="w-4 h-4 text-accent" />
                        <span className="font-mono text-primary">{ret.return_number}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono text-muted-foreground">
                      {ret.purchase_invoice?.invoice_number}
                    </td>
                    <td className="py-4 px-4 font-medium text-foreground">{ret.product?.name}</td>
                    <td className="py-4 px-4 text-muted-foreground">{ret.quantity}</td>
                    <td className="py-4 px-4 font-semibold text-destructive">
                      -${Number(ret.total_price || 0).toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">{ret.reason || 'N/A'}</td>
                    <td className="py-4 px-4 text-muted-foreground">
                      {new Date(ret.return_date).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="py-4 px-4">{getStatusBadge(ret.status)}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1">
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
                                هل أنت متأكد من حذف هذا المرتجع؟
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(ret.id)}
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
                  <td colSpan={9} className="py-8 text-center text-muted-foreground">
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

const Returns: React.FC = () => {
  return (
    <PageErrorBoundary pageName="المرتجعات">
      <ReturnsContent />
    </PageErrorBoundary>
  );
};

export default Returns;
