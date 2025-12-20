import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Coins, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { settingsService } from '@/api/settingsService';
import PageErrorBoundary from '@/components/PageErrorBoundary';

const CurrenciesContent: React.FC = () => {
  const { t } = useTranslation();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<any | null>(null);
  const [newCurrency, setNewCurrency] = useState({ 
    name: '', 
    code: '', 
    symbol: '', 
    exchange_rate: '1.00' 
  });
  const queryClient = useQueryClient();

  // جلب العملات من API
  const { data: currencies = [], isLoading } = useQuery({
    queryKey: ['currencies'],
    queryFn: () => settingsService.getCurrencies(),
  });

  // إضافة عملة جديدة
  const createMutation = useMutation({
    mutationFn: (data: any) => settingsService.createCurrency(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currencies'] });
      setNewCurrency({ name: '', code: '', symbol: '', exchange_rate: '1.00' });
      setIsAddOpen(false);
      toast.success('تم إضافة العملة بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في إضافة العملة');
    },
  });

  // تحديث عملة
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      settingsService.updateCurrency(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currencies'] });
      setIsEditOpen(false);
      setEditingCurrency(null);
      toast.success('تم تحديث العملة بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في تحديث العملة');
    },
  });

  // حذف عملة
  const deleteMutation = useMutation({
    mutationFn: (id: number) => settingsService.deleteCurrency(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currencies'] });
      toast.success('تم حذف العملة بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في حذف العملة');
    },
  });

  const handleAdd = () => {
    if (!newCurrency.name || !newCurrency.code || !newCurrency.symbol) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    createMutation.mutate({
      name: newCurrency.name,
      code: newCurrency.code.toUpperCase(),
      symbol: newCurrency.symbol,
      exchange_rate: parseFloat(newCurrency.exchange_rate) || 1.0,
    });
  };

  const handleEdit = () => {
    if (!editingCurrency || !editingCurrency.name || !editingCurrency.code || !editingCurrency.symbol) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    updateMutation.mutate({
      id: editingCurrency.id,
      data: {
        name: editingCurrency.name,
        code: editingCurrency.code.toUpperCase(),
        symbol: editingCurrency.symbol,
        exchange_rate: parseFloat(editingCurrency.exchange_rate) || 1.0,
      },
    });
  };

  const openEditDialog = (currency: any) => {
    setEditingCurrency({ 
      ...currency,
      exchange_rate: currency.exchange_rate.toString()
    });
    setIsEditOpen(true);
  };

  const handleDelete = (id: number, isDefault: boolean) => {
    if (isDefault) {
      toast.error('لا يمكن حذف العملة الافتراضية');
      return;
    }
    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">العملات</h1>
          <p className="text-muted-foreground mt-1">إدارة العملات وأسعار الصرف</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0 gap-2">
              <Plus className="w-4 h-4" />
              إضافة عملة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة عملة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>اسم العملة *</Label>
                <Input
                  value={newCurrency.name}
                  onChange={(e) => setNewCurrency({ ...newCurrency, name: e.target.value })}
                  placeholder="مثال: يورو"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الرمز الدولي *</Label>
                  <Input
                    value={newCurrency.code}
                    onChange={(e) => setNewCurrency({ ...newCurrency, code: e.target.value.toUpperCase() })}
                    placeholder="EUR"
                    maxLength={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الرمز *</Label>
                  <Input
                    value={newCurrency.symbol}
                    onChange={(e) => setNewCurrency({ ...newCurrency, symbol: e.target.value })}
                    placeholder="€"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>سعر الصرف *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newCurrency.exchange_rate}
                  onChange={(e) => setNewCurrency({ ...newCurrency, exchange_rate: e.target.value })}
                  placeholder="1.00"
                />
                <p className="text-xs text-muted-foreground">
                  سعر الصرف مقابل العملة الافتراضية
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  إلغاء
                </Button>
                <Button 
                  onClick={handleAdd} 
                  className="gradient-primary border-0"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'جاري الإضافة...' : 'إضافة'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل العملة</DialogTitle>
          </DialogHeader>
          {editingCurrency && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>اسم العملة *</Label>
                <Input
                  value={editingCurrency.name}
                  onChange={(e) => setEditingCurrency({ ...editingCurrency, name: e.target.value })}
                  placeholder="اسم العملة"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الرمز الدولي *</Label>
                  <Input
                    value={editingCurrency.code}
                    onChange={(e) => setEditingCurrency({ ...editingCurrency, code: e.target.value.toUpperCase() })}
                    placeholder="USD"
                    maxLength={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الرمز *</Label>
                  <Input
                    value={editingCurrency.symbol}
                    onChange={(e) => setEditingCurrency({ ...editingCurrency, symbol: e.target.value })}
                    placeholder="$"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>سعر الصرف *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editingCurrency.exchange_rate}
                  onChange={(e) => setEditingCurrency({ ...editingCurrency, exchange_rate: e.target.value })}
                  placeholder="1.00"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                  إلغاء
                </Button>
                <Button 
                  onClick={handleEdit} 
                  className="gradient-primary border-0"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Currencies Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {currencies.map((currency: any, index: number) => (
          <motion.div
            key={currency.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card p-5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-bold">
                  {currency.symbol}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">{currency.name}</h4>
                    {currency.is_default && (
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{currency.code}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(currency)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive"
                      disabled={currency.is_default}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                      <AlertDialogDescription>
                        هل أنت متأكد من حذف العملة "{currency.name}"؟
                        لا يمكن التراجع عن هذا الإجراء.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(currency.id, currency.is_default)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        حذف
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">سعر الصرف:</span>
                <span className="font-semibold text-foreground">{currency.exchange_rate}</span>
              </div>
              {currency.is_default && (
                <div className="text-xs text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded">
                  العملة الافتراضية
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {currencies.length === 0 && (
        <div className="text-center py-12">
          <Coins className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">لا توجد عملات</h3>
          <p className="text-muted-foreground mb-4">ابدأ بإضافة عملة جديدة</p>
        </div>
      )}
    </div>
  );
};

const Currencies: React.FC = () => {
  return (
    <PageErrorBoundary pageName="العملات">
      <CurrenciesContent />
    </PageErrorBoundary>
  );
};

export default Currencies;
