import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Wallet, CreditCard, Save, AlertTriangle } from 'lucide-react';
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
import paymentMethodService from '@/api/paymentMethodService';
import PageErrorBoundary from '@/components/PageErrorBoundary';

const WalletSettingsContent: React.FC = () => {
  const { t } = useTranslation();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<any | null>(null);
  const [newWallet, setNewWallet] = useState({ name: '', icon: '💳' });
  const queryClient = useQueryClient();

  // جلب طرق الدفع من API
  const { data: wallets = [], isLoading } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: () => paymentMethodService.getAll(),
  });

  // إضافة طريقة دفع جديدة
  const createMutation = useMutation({
    mutationFn: (data: { name: string; icon: string }) => 
      paymentMethodService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      setNewWallet({ name: '', icon: '💳' });
      setIsAddOpen(false);
      toast.success('تم إضافة طريقة الدفع بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في إضافة طريقة الدفع');
    },
  });

  // تحديث طريقة دفع
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      paymentMethodService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      setIsEditOpen(false);
      setEditingWallet(null);
      toast.success('تم تحديث طريقة الدفع بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في تحديث طريقة الدفع');
    },
  });

  // حذف طريقة دفع
  const deleteMutation = useMutation({
    mutationFn: (id: number) => paymentMethodService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast.success('تم حذف طريقة الدفع بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في حذف طريقة الدفع');
    },
  });

  // تفعيل/تعطيل طريقة دفع
  const toggleActiveMutation = useMutation({
    mutationFn: (id: number) => paymentMethodService.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في تغيير حالة طريقة الدفع');
    },
  });

  const handleAdd = () => {
    if (!newWallet.name) {
      toast.error('يرجى إدخال اسم طريقة الدفع');
      return;
    }
    createMutation.mutate(newWallet);
  };

  const handleEdit = () => {
    if (!editingWallet || !editingWallet.name) {
      toast.error('يرجى إدخال اسم طريقة الدفع');
      return;
    }
    updateMutation.mutate({
      id: editingWallet.id,
      data: {
        name: editingWallet.name,
        icon: editingWallet.icon,
      },
    });
  };

  const openEditDialog = (wallet: any) => {
    setEditingWallet({ ...wallet });
    setIsEditOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const toggleActive = (id: number) => {
    toggleActiveMutation.mutate(id);
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
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">إعدادات المحافظ</h1>
          <p className="text-muted-foreground mt-1">إدارة طرق الدفع الإلكترونية</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0 gap-2">
              <Plus className="w-4 h-4" />
              إضافة طريقة دفع
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة طريقة دفع جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>الاسم *</Label>
                <Input
                  value={newWallet.name}
                  onChange={(e) => setNewWallet({ ...newWallet, name: e.target.value })}
                  placeholder="مثال: STC Pay"
                />
              </div>
              <div className="space-y-2">
                <Label>الأيقونة</Label>
                <Input
                  value={newWallet.icon}
                  onChange={(e) => setNewWallet({ ...newWallet, icon: e.target.value })}
                  placeholder="💳"
                  className="text-center text-2xl"
                />
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
            <DialogTitle>تعديل طريقة الدفع</DialogTitle>
          </DialogHeader>
          {editingWallet && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>الاسم *</Label>
                <Input
                  value={editingWallet.name}
                  onChange={(e) => setEditingWallet({ ...editingWallet, name: e.target.value })}
                  placeholder="اسم طريقة الدفع"
                />
              </div>
              <div className="space-y-2">
                <Label>الأيقونة</Label>
                <Input
                  value={editingWallet.icon}
                  onChange={(e) => setEditingWallet({ ...editingWallet, icon: e.target.value })}
                  placeholder="💳"
                  className="text-center text-2xl"
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

      {/* Wallets Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {wallets.map((wallet: any, index: number) => (
          <motion.div
            key={wallet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`glass-card p-5 ${!wallet.is_active ? 'opacity-50' : ''}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                  {wallet.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{wallet.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {wallet.is_active ? 'مفعل' : 'غير مفعل'}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(wallet)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                      <AlertDialogDescription>
                        هل أنت متأكد من حذف طريقة الدفع "{wallet.name}"؟
                        لا يمكن التراجع عن هذا الإجراء.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(wallet.id)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        حذف
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-sm text-muted-foreground">الحالة</span>
              <Button
                variant={wallet.is_active ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleActive(wallet.id)}
                className={wallet.is_active ? 'bg-success hover:bg-success/90' : ''}
                disabled={toggleActiveMutation.isPending}
              >
                {wallet.is_active ? 'مفعل' : 'غير مفعل'}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {wallets.length === 0 && (
        <div className="text-center py-12">
          <Wallet className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">لا توجد طرق دفع</h3>
          <p className="text-muted-foreground mb-4">ابدأ بإضافة طريقة دفع جديدة</p>
        </div>
      )}
    </div>
  );
};

const WalletSettings: React.FC = () => {
  return (
    <PageErrorBoundary pageName="إعدادات المحافظ">
      <WalletSettingsContent />
    </PageErrorBoundary>
  );
};

export default WalletSettings;
