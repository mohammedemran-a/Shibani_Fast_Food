import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Truck, Phone, Mail, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supplierService, Supplier, CreateSupplierData } from '@/api/supplierService';
import PageErrorBoundary from '@/components/PageErrorBoundary';

/**
 * صفحة إدارة الموردين
 * 
 * تعرض قائمة الموردين مع إمكانية:
 * - إضافة مورد جديد
 * - تعديل مورد موجود
 * - حذف مورد
 * - البحث في الموردين
 */
const SuppliersContent: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  // حالات النوافذ المنبثقة
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [editingSupplier, setEditingSupplier] = React.useState<Supplier | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // بيانات المورد الجديد
  const [newSupplier, setNewSupplier] = React.useState<CreateSupplierData>({ 
    name: '', 
    phone: '', 
    email: '', 
    address: '' 
  });

  // جلب الموردين من API
  const { data: suppliersData, isLoading, error } = useQuery({
    queryKey: ['suppliers', searchQuery],
    queryFn: () => supplierService.getSuppliers({ search: searchQuery }),
  });

  // إضافة مورد جديد
  const createMutation = useMutation({
    mutationFn: (data: CreateSupplierData) => supplierService.createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setNewSupplier({ name: '', phone: '', email: '', address: '' });
      setIsAddOpen(false);
      toast.success(t('suppliers.addSuccess'));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('suppliers.addError'));
    },
  });

  // تعديل مورد
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateSupplierData> }) => 
      supplierService.updateSupplier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setIsEditOpen(false);
      setEditingSupplier(null);
      toast.success(t('suppliers.editSuccess'));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('suppliers.editError'));
    },
  });

  // حذف مورد
  const deleteMutation = useMutation({
    mutationFn: (id: number) => supplierService.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success(t('suppliers.deleteSuccess'));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('suppliers.deleteError'));
    },
  });

  // استخراج قائمة الموردين من البيانات
  const suppliers: Supplier[] = suppliersData?.data?.data || suppliersData?.data || [];

  // إضافة مورد جديد
  const handleAdd = () => {
    if (!newSupplier.name || !newSupplier.phone) {
      toast.error(t('suppliers.requiredFields'));
      return;
    }
    createMutation.mutate(newSupplier);
  };

  // تعديل مورد
  const handleEdit = () => {
    if (!editingSupplier || !editingSupplier.name || !editingSupplier.phone) {
      toast.error(t('suppliers.requiredFields'));
      return;
    }
    updateMutation.mutate({
      id: editingSupplier.id,
      data: {
        name: editingSupplier.name,
        phone: editingSupplier.phone,
        email: editingSupplier.email,
        address: editingSupplier.address,
      },
    });
  };

  // فتح نافذة التعديل
  const openEditDialog = (supplier: Supplier) => {
    setEditingSupplier({ ...supplier });
    setIsEditOpen(true);
  };

  // حذف مورد مع تأكيد
  const handleDelete = (id: number) => {
    if (window.confirm(t('suppliers.confirmDelete'))) {
      deleteMutation.mutate(id);
    }
  };

  // عرض حالة التحميل
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // عرض حالة الخطأ
  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-destructive">{t('common.errorLoading')}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['suppliers'] })}
        >
          {t('common.retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* العنوان وزر الإضافة */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('suppliers.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('suppliers.subtitle')}</p>
        </div>
        
        {/* نافذة إضافة مورد */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0 gap-2">
              <Plus className="w-4 h-4" />
              {t('suppliers.addSupplier')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('suppliers.addSupplier')}</DialogTitle>
              <DialogDescription>
                {t('suppliers.addSupplierDescription') || 'أدخل بيانات المورد الجديد'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>{t('suppliers.name')} *</Label>
                <Input
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  placeholder={t('suppliers.name')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('suppliers.phone')} *</Label>
                <Input
                  value={newSupplier.phone}
                  onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                  placeholder="+966XXXXXXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('suppliers.email')}</Label>
                <Input
                  type="email"
                  value={newSupplier.email || ''}
                  onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                  placeholder="email@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('suppliers.address')}</Label>
                <Input
                  value={newSupplier.address || ''}
                  onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                  placeholder={t('suppliers.address')}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button 
                  onClick={handleAdd} 
                  className="gradient-primary border-0"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    t('common.add')
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* نافذة تعديل مورد */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('suppliers.editSupplier')}</DialogTitle>
            <DialogDescription>
              {t('suppliers.editSupplierDescription') || 'تعديل بيانات المورد'}
            </DialogDescription>
          </DialogHeader>
          {editingSupplier && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>{t('suppliers.name')} *</Label>
                <Input
                  value={editingSupplier.name}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, name: e.target.value })}
                  placeholder={t('suppliers.name')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('suppliers.phone')} *</Label>
                <Input
                  value={editingSupplier.phone}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, phone: e.target.value })}
                  placeholder="+966XXXXXXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('suppliers.email')}</Label>
                <Input
                  type="email"
                  value={editingSupplier.email || ''}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, email: e.target.value })}
                  placeholder="email@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('suppliers.address')}</Label>
                <Input
                  value={editingSupplier.address || ''}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, address: e.target.value })}
                  placeholder={t('suppliers.address')}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button 
                  onClick={handleEdit} 
                  className="gradient-primary border-0"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    t('common.save')
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* حقل البحث */}
      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder={t('common.search')} 
            className="ps-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* قائمة الموردين */}
      {suppliers.length === 0 ? (
        <div className="text-center py-10">
          <Truck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{t('suppliers.noSuppliers')}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((supplier, index) => (
            <motion.div
              key={supplier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center">
                    <Truck className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{supplier.name}</h4>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => openEditDialog(supplier)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive" 
                    onClick={() => handleDelete(supplier.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{supplier.phone}</span>
                </div>
                {supplier.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{supplier.email}</span>
                  </div>
                )}
                {supplier.address && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{supplier.address}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">{t('suppliers.totalPurchases')}</p>
                <p className="text-xl font-bold text-primary">
                  {supplier.is_active ? (
                    <span className="text-green-500">{t('common.active')}</span>
                  ) : (
                    <span className="text-red-500">{t('common.inactive')}</span>
                  )}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// تغليف الصفحة بـ Error Boundary
const Suppliers: React.FC = () => (
  <PageErrorBoundary pageName="الموردين">
    <SuppliersContent />
  </PageErrorBoundary>
);

export default Suppliers;
