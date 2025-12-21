import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, UserCircle, Phone, Mail, Eye, AlertTriangle } from 'lucide-react';
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
import { customerService, CreateCustomerData } from '@/api/customerService';
import PageErrorBoundary from '@/components/PageErrorBoundary';

const CustomersContent: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [newCustomer, setNewCustomer] = useState<CreateCustomerData>({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    country: '',
    notes: '',
  });
  const queryClient = useQueryClient();

  // جلب العملاء من API
  const { data: customersData, isLoading, error } = useQuery({
    queryKey: ['customers', search],
    queryFn: () => customerService.getCustomers({ search }),
  });

  // إضافة عميل جديد
  const createMutation = useMutation({
    mutationFn: (data: CreateCustomerData) => customerService.createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setNewCustomer({ name: '', phone: '', email: '', address: '', city: '', country: '', notes: '' });
      setIsAddOpen(false);
      toast.success('تم إضافة العميل بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في إضافة العميل');
    },
  });

  // تحديث عميل
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      customerService.updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsEditOpen(false);
      setEditingCustomer(null);
      toast.success('تم تحديث بيانات العميل بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في تحديث بيانات العميل');
    },
  });

  // حذف عميل
  const deleteMutation = useMutation({
    mutationFn: customerService.deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('تم حذف العميل بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل في حذف العميل');
    },
  });

  const handleAdd = () => {
    if (!newCustomer.name.trim()) {
      toast.error('اسم العميل مطلوب');
      return;
    }
    if (!newCustomer.phone.trim()) {
      toast.error('رقم الهاتف مطلوب');
      return;
    }
    createMutation.mutate(newCustomer);
  };

  const handleEdit = () => {
    if (!editingCustomer) return;
    if (!editingCustomer.name.trim()) {
      toast.error('اسم العميل مطلوب');
      return;
    }
    if (!editingCustomer.phone.trim()) {
      toast.error('رقم الهاتف مطلوب');
      return;
    }
    updateMutation.mutate({ id: editingCustomer.id, data: editingCustomer });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const openEditDialog = (customer: any) => {
    setEditingCustomer({ ...customer });
    setIsEditOpen(true);
  };

  // البيانات تأتي من API بشكل { success: true, data: { data: [...] } }
  const customers = customersData?.data?.data || customersData?.data || [];

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
          <p className="text-destructive mb-4">حدث خطأ في تحميل العملاء</p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['customers'] })}>
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('nav.customers')}</h1>
          <p className="text-muted-foreground mt-1">{t('people.customersSubtitle')}</p>
        </div>
        
        {/* Add Customer Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0 gap-2">
              <Plus className="w-4 h-4" />
              {t('people.addCustomer')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>إضافة عميل جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>اسم العميل *</Label>
                <Input
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  placeholder="أدخل اسم العميل"
                />
              </div>
              <div className="space-y-2">
                <Label>رقم الهاتف *</Label>
                <Input
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  placeholder="أدخل رقم الهاتف"
                />
              </div>
              <div className="space-y-2">
                <Label>البريد الإلكتروني</Label>
                <Input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  placeholder="أدخل البريد الإلكتروني"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>المدينة</Label>
                  <Input
                    value={newCustomer.city}
                    onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                    placeholder="المدينة"
                  />
                </div>
                <div className="space-y-2">
                  <Label>الدولة</Label>
                  <Input
                    value={newCustomer.country}
                    onChange={(e) => setNewCustomer({ ...newCustomer, country: e.target.value })}
                    placeholder="الدولة"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>العنوان</Label>
                <Input
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  placeholder="أدخل العنوان"
                />
              </div>
              <div className="space-y-2">
                <Label>ملاحظات</Label>
                <Input
                  value={newCustomer.notes}
                  onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                  placeholder="ملاحظات إضافية"
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

      {/* Edit Customer Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل بيانات العميل</DialogTitle>
          </DialogHeader>
          {editingCustomer && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>اسم العميل *</Label>
                <Input
                  value={editingCustomer.name}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                  placeholder="أدخل اسم العميل"
                />
              </div>
              <div className="space-y-2">
                <Label>رقم الهاتف *</Label>
                <Input
                  value={editingCustomer.phone}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                  placeholder="أدخل رقم الهاتف"
                />
              </div>
              <div className="space-y-2">
                <Label>البريد الإلكتروني</Label>
                <Input
                  type="email"
                  value={editingCustomer.email || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                  placeholder="أدخل البريد الإلكتروني"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>المدينة</Label>
                  <Input
                    value={editingCustomer.city || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, city: e.target.value })}
                    placeholder="المدينة"
                  />
                </div>
                <div className="space-y-2">
                  <Label>الدولة</Label>
                  <Input
                    value={editingCustomer.country || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, country: e.target.value })}
                    placeholder="الدولة"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>العنوان</Label>
                <Input
                  value={editingCustomer.address || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                  placeholder="أدخل العنوان"
                />
              </div>
              <div className="space-y-2">
                <Label>ملاحظات</Label>
                <Input
                  value={editingCustomer.notes || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, notes: e.target.value })}
                  placeholder="ملاحظات إضافية"
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

      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder={t('common.search')} 
            className="ps-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {customers.map((customer: any, index: number) => (
          <motion.div
            key={customer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card p-5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                  <UserCircle className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    {customer.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {customer.sales_invoices_count || 0} {t('people.visits')}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => navigate(`/people/customers/${customer.id}`)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => openEditDialog(customer)}
                >
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
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                        {t('common.warning')}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        هل أنت متأكد من حذف العميل "{customer.name}"؟
                        لا يمكن التراجع عن هذا الإجراء.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDelete(customer.id)} 
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {t('common.confirm')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{customer.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{customer.email || 'N/A'}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">{t('people.totalPurchases')}</p>
              <p className="text-xl font-bold text-success">
                ${Number(customer.sales_invoices_sum_total_amount || 0).toFixed(2)}
              </p>
            </div>
          </motion.div>
        ))}
        {customers.length === 0 && (
          <div className="col-span-full text-center py-12">
            <UserCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">لا يوجد عملاء</h3>
            <p className="text-muted-foreground mb-4">ابدأ بإضافة عميل جديد</p>
          </div>
        )}
      </div>
    </div>
  );
};

// تصدير الصفحة مع حماية ضد الأخطاء
const Customers: React.FC = () => {
  return (
    <PageErrorBoundary pageName="العملاء">
      <CustomersContent />
    </PageErrorBoundary>
  );
};

export default Customers;
