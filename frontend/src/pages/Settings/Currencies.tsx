import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Coins, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
// 1. استيراد النوع الجديد من ملف الخدمة
import { settingsService, CreateCurrencyData } from '@/api/settingsService'; 
import PageErrorBoundary from '@/components/PageErrorBoundary';

interface Currency {
  id: number;
  name: string;
  code: string;
  symbol: string;
  exchange_rate: number;
  is_default: boolean;
}

const CurrenciesContent: React.FC = () => {
  const { t } = useTranslation();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Partial<Currency> | null>(null);
  const [newCurrency, setNewCurrency] = useState({ 
    name: '', 
    code: '', 
    symbol: '', 
    exchange_rate: '1.00',
    is_default: false,
  });
  const queryClient = useQueryClient();

  const { data: currencies = [], isLoading } = useQuery<Currency[]>({
    queryKey: ['currencies'],
    queryFn: () => settingsService.getCurrencies(),
  });

  // 2. تحديث الـ mutation ليستخدم النوع الدقيق `CreateCurrencyData`
  const createMutation = useMutation({
    mutationFn: (data: CreateCurrencyData) => settingsService.createCurrency(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currencies'] });
      setNewCurrency({ name: '', code: '', symbol: '', exchange_rate: '1.00', is_default: false });
      setIsAddOpen(false);
      toast.success(t('currencies.addSuccess'));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('common.error'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Currency> }) => 
      settingsService.updateCurrency(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currencies'] });
      setIsEditOpen(false);
      setEditingCurrency(null);
      toast.success(t('currencies.editSuccess'));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('common.error'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => settingsService.deleteCurrency(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currencies'] });
      toast.success(t('currencies.deleteSuccess'));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('common.error'));
    },
  });

  useEffect(() => {
    if (newCurrency.is_default) {
      setNewCurrency(prev => ({ ...prev, exchange_rate: '1.00' }));
    }
  }, [newCurrency.is_default]);

  useEffect(() => {
    if (editingCurrency?.is_default) {
      setEditingCurrency(prev => prev ? { ...prev, exchange_rate: 1.00 } : null);
    }
  }, [editingCurrency?.is_default]);

  const handleAdd = () => {
    if (!newCurrency.name || !newCurrency.code || !newCurrency.symbol) {
      toast.error(t('currencies.requiredFields'));
      return;
    }
    // 3. الكائن الذي يتم إرساله الآن يطابق النوع `CreateCurrencyData` تمامًا
    createMutation.mutate({
      name: newCurrency.name,
      code: newCurrency.code.toUpperCase(),
      symbol: newCurrency.symbol,
      exchange_rate: parseFloat(newCurrency.exchange_rate) || 1.0,
      is_default: newCurrency.is_default,
    });
  };

  const handleEdit = () => {
    if (!editingCurrency || !editingCurrency.name || !editingCurrency.code || !editingCurrency.symbol) {
      toast.error(t('currencies.requiredFields'));
      return;
    }
    updateMutation.mutate({
      id: editingCurrency.id!,
      data: {
        name: editingCurrency.name,
        code: editingCurrency.code.toUpperCase(),
        symbol: editingCurrency.symbol,
        exchange_rate: parseFloat(editingCurrency.exchange_rate!.toString()) || 1.0,
        is_default: editingCurrency.is_default,
      },
    });
  };

  const handleSetDefault = (currency: Currency) => {
    if (currency.is_default) return;
    toast.promise(
      updateMutation.mutateAsync({
        id: currency.id,
        data: { is_default: true },
      }),
      {
        loading: t('common.saving'),
        success: `تم تعيين "${currency.name}" كعملة افتراضية.`,
        error: (err: any) => err.response?.data?.message || t('common.error'),
      }
    );
  };

  const openEditDialog = (currency: Currency) => {
    setEditingCurrency(currency);
    setIsEditOpen(true);
  };

  const handleDelete = (id: number, isDefault: boolean) => {
    if (isDefault) {
      toast.error(t('currencies.deleteDefaultError'));
      return;
    }
    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('currencies.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('currencies.subtitle')}</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0 gap-2">
              <Plus className="w-4 h-4" />
              {t('currencies.addCurrency')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('currencies.addCurrency')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>{t('currencies.name')} *</Label>
                <Input value={newCurrency.name} onChange={(e) => setNewCurrency({ ...newCurrency, name: e.target.value })} placeholder="مثال: يورو" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('currencies.code')} *</Label>
                  <Input value={newCurrency.code} onChange={(e) => setNewCurrency({ ...newCurrency, code: e.target.value.toUpperCase() })} placeholder="EUR" maxLength={3} />
                </div>
                <div className="space-y-2">
                  <Label>{t('currencies.symbol')} *</Label>
                  <Input value={newCurrency.symbol} onChange={(e) => setNewCurrency({ ...newCurrency, symbol: e.target.value })} placeholder="€" />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label htmlFor="is-default-add">{t('currencies.isDefault')}</Label>
                <Switch
                  id="is-default-add"
                  checked={newCurrency.is_default}
                  onCheckedChange={(checked) => setNewCurrency({ ...newCurrency, is_default: checked })}
                />
              </div>
              {!newCurrency.is_default && (
                <div className="space-y-2">
                  <Label>{t('currencies.exchangeRate')} *</Label>
                  <Input type="number" step="0.01" value={newCurrency.exchange_rate} onChange={(e) => setNewCurrency({ ...newCurrency, exchange_rate: e.target.value })} placeholder="1.00" />
                  <p className="text-xs text-muted-foreground">{t('currencies.exchangeRateHelp')}</p>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>{t('common.cancel')}</Button>
                <Button onClick={handleAdd} className="gradient-primary border-0" disabled={createMutation.isPending}>
                  {createMutation.isPending ? t('common.adding') : t('common.add')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('currencies.editCurrency')}</DialogTitle>
          </DialogHeader>
          {editingCurrency && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>{t('currencies.name')} *</Label>
                <Input value={editingCurrency.name} onChange={(e) => setEditingCurrency({ ...editingCurrency, name: e.target.value })} placeholder={t('currencies.name')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('currencies.code')} *</Label>
                  <Input value={editingCurrency.code} onChange={(e) => setEditingCurrency({ ...editingCurrency, code: e.target.value.toUpperCase() })} placeholder="USD" maxLength={3} />
                </div>
                <div className="space-y-2">
                  <Label>{t('currencies.symbol')} *</Label>
                  <Input value={editingCurrency.symbol} onChange={(e) => setEditingCurrency({ ...editingCurrency, symbol: e.target.value })} placeholder="$" />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label htmlFor="is-default-edit">{t('currencies.isDefault')}</Label>
                <Switch
                  id="is-default-edit"
                  checked={editingCurrency.is_default}
                  onCheckedChange={(checked) => setEditingCurrency({ ...editingCurrency, is_default: checked })}
                />
              </div>
              {!editingCurrency.is_default && (
                <div className="space-y-2">
                  <Label>{t('currencies.exchangeRate')} *</Label>
                  <Input type="number" step="0.01" value={editingCurrency.exchange_rate} onChange={(e) => setEditingCurrency({ ...editingCurrency, exchange_rate: Number(e.target.value) })} placeholder="1.00" />
                </div>
              )}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>{t('common.cancel')}</Button>
                <Button onClick={handleEdit} className="gradient-primary border-0" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? t('common.saving') : t('common.save')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {currencies.map((currency, index) => (
          <motion.div key={currency.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="glass-card p-5 flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-bold">{currency.symbol}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">{currency.name}</h4>
                    {currency.is_default && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{currency.code}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(currency)}><Edit2 className="w-4 h-4" /></Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" disabled={currency.is_default}><Trash2 className="w-4 h-4" /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('common.confirmDelete')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('common.deleteUserWarning', { item: currency.name })}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(currency.id, currency.is_default)} className="bg-destructive hover:bg-destructive/90">{t('common.delete')}</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <div className="space-y-2 pt-3 border-t border-border flex-grow">
              {!currency.is_default && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('currencies.exchangeRate')}:</span>
                  <span className="font-semibold text-foreground">{currency.exchange_rate}</span>
                </div>
              )}
            </div>
            <div className="mt-4">
              {currency.is_default ? (
                <div className="text-xs text-center font-medium text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-2 rounded-md">
                  {t('currencies.isDefault')}
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => handleSetDefault(currency)}
                  disabled={updateMutation.isPending}
                >
                  <Star className="w-4 h-4" />
                  {t('currencies.setDefault', { defaultValue: 'Set as Default' })}
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {currencies.length === 0 && (
        <div className="text-center py-12">
          <Coins className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">{t('currencies.noCurrencies', { defaultValue: 'No Currencies Found' })}</h3>
          <p className="text-muted-foreground mb-4">{t('currencies.startByAdding', { defaultValue: 'Start by adding a new currency.' })}</p>
        </div>
      )}
    </div>
  );
};

const Currencies: React.FC = () => {
  return (
    <PageErrorBoundary pageName={useTranslation().t('currencies.title')}>
      <CurrenciesContent />
    </PageErrorBoundary>
  );
};

export default Currencies;
