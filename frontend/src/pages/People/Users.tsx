import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, UserCog, Shield, Mail, Phone, Search, Loader2, AlertCircle } from 'lucide-react';
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
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { userService, type User, type CreateUserData, type UpdateUserData } from '@/api/userService';

const roles = [
  { id: 1, name: 'مدير', color: '#3b82f6' },
  { id: 2, name: 'كاشير', color: '#10b981' },
  { id: 3, name: 'محاسب', color: '#f59e0b' },
  { id: 4, name: 'مدير المخزون', color: '#8b5cf6' },
];

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role_id: number | null;
}

const Users: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    role_id: null,
  });

  // Fetch users
  const { data: usersResponse, isLoading, error } = useQuery({
    queryKey: ['users', searchQuery],
    queryFn: () => userService.getAll({ search: searchQuery }),
  });

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateUserData) => userService.create(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || 'تم إضافة المستخدم بنجاح');
        queryClient.invalidateQueries({ queryKey: ['users'] });
        setIsAddOpen(false);
        resetForm();
      } else {
        toast.error(response.message || 'فشل إضافة المستخدم');
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'حدث خطأ أثناء إضافة المستخدم';
      toast.error(message);
    },
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserData }) => 
      userService.update(id, data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || 'تم تحديث المستخدم بنجاح');
        queryClient.invalidateQueries({ queryKey: ['users'] });
        setIsEditOpen(false);
        setEditingUser(null);
        resetForm();
      } else {
        toast.error(response.message || 'فشل تحديث المستخدم');
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'حدث خطأ أثناء تحديث المستخدم';
      toast.error(message);
    },
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => userService.delete(id),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || 'تم حذف المستخدم بنجاح');
        queryClient.invalidateQueries({ queryKey: ['users'] });
        setDeleteUserId(null);
      } else {
        toast.error(response.message || 'فشل حذف المستخدم');
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'حدث خطأ أثناء حذف المستخدم';
      toast.error(message);
      setDeleteUserId(null);
    },
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: (id: number) => userService.toggleActive(id),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || 'تم تغيير حالة المستخدم بنجاح');
        queryClient.invalidateQueries({ queryKey: ['users'] });
      } else {
        toast.error(response.message || 'فشل تغيير حالة المستخدم');
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'حدث خطأ أثناء تغيير حالة المستخدم';
      toast.error(message);
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      role_id: null,
    });
  };

  const handleAdd = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.role_id) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    createMutation.mutate({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      role_id: formData.role_id,
    });
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      password: '',
      role_id: user.role_id,
    });
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    if (!editingUser) return;

    if (!formData.name || !formData.email || !formData.role_id) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const updateData: UpdateUserData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role_id: formData.role_id,
    };

    // Only include password if it's provided
    if (formData.password) {
      updateData.password = formData.password;
    }

    updateMutation.mutate({ id: editingUser.id, data: updateData });
  };

  const handleDelete = (id: number) => {
    setDeleteUserId(id);
  };

  const confirmDelete = () => {
    if (deleteUserId) {
      deleteMutation.mutate(deleteUserId);
    }
  };

  const getRoleBadge = (roleId: number) => {
    const role = roles.find(r => r.id === roleId);
    return (
      <span 
        className="px-2 py-1 rounded-full text-xs font-medium"
        style={{ backgroundColor: role?.color + '20', color: role?.color }}
      >
        {role?.name || 'غير محدد'}
      </span>
    );
  };

  const users = usersResponse?.data?.data || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <UserCog className="w-8 h-8 text-primary" />
            {t('nav.users')}
          </h1>
          <p className="text-muted-foreground mt-1">إدارة مستخدمي النظام</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0 gap-2">
              <Plus className="w-4 h-4" />
              إضافة مستخدم جديد
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة مستخدم جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>الاسم الكامل *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="أدخل الاسم الكامل"
                />
              </div>
              <div className="space-y-2">
                <Label>البريد الإلكتروني *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@domain.com"
                />
              </div>
              <div className="space-y-2">
                <Label>رقم الهاتف</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+966XXXXXXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label>كلمة المرور *</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="أدخل كلمة المرور"
                />
              </div>
              <div className="space-y-2">
                <Label>الدور الوظيفي *</Label>
                <Select
                  value={formData.role_id?.toString()}
                  onValueChange={(value) => setFormData({ ...formData, role_id: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الدور" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleAdd}
                  disabled={createMutation.isPending}
                  className="flex-1 gradient-primary"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      جاري الإضافة...
                    </>
                  ) : (
                    'إضافة'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddOpen(false);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="ابحث عن مستخدم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="glass-card p-6 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive">حدث خطأ أثناء تحميل المستخدمين</p>
          <Button
            variant="outline"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['users'] })}
            className="mt-4"
          >
            إعادة المحاولة
          </Button>
        </div>
      )}

      {/* Users Table */}
      {!isLoading && !error && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-right p-4 font-semibold">الاسم</th>
                  <th className="text-right p-4 font-semibold">البريد الإلكتروني</th>
                  <th className="text-right p-4 font-semibold">الهاتف</th>
                  <th className="text-right p-4 font-semibold">الدور</th>
                  <th className="text-right p-4 font-semibold">الحالة</th>
                  <th className="text-center p-4 font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                      لا توجد مستخدمين
                    </td>
                  </tr>
                ) : (
                  users.map((user: User) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-t border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <UserCog className="w-5 h-5 text-primary" />
                          </div>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          {user.phone || '-'}
                        </div>
                      </td>
                      <td className="p-4">{getRoleBadge(user.role_id)}</td>
                      <td className="p-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActiveMutation.mutate(user.id)}
                          disabled={toggleActiveMutation.isPending}
                          className={user.is_active ? 'text-success' : 'text-muted-foreground'}
                        >
                          {user.is_active ? 'نشط' : 'معطل'}
                        </Button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(user)}
                            className="text-primary hover:text-primary"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل المستخدم</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>الاسم الكامل *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="أدخل الاسم الكامل"
              />
            </div>
            <div className="space-y-2">
              <Label>البريد الإلكتروني *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@domain.com"
              />
            </div>
            <div className="space-y-2">
              <Label>رقم الهاتف</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+966XXXXXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label>كلمة المرور الجديدة (اتركها فارغة إذا لم ترد التغيير)</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="أدخل كلمة المرور الجديدة"
              />
            </div>
            <div className="space-y-2">
              <Label>الدور الوظيفي *</Label>
              <Select
                value={formData.role_id?.toString()}
                onValueChange={(value) => setFormData({ ...formData, role_id: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الدور" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleUpdate}
                disabled={updateMutation.isPending}
                className="flex-1 gradient-primary"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري التحديث...
                  </>
                ) : (
                  'تحديث'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditOpen(false);
                  setEditingUser(null);
                  resetForm();
                }}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteUserId !== null} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                'حذف'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Users;
