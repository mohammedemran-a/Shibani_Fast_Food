import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, UserCog, Mail, Phone, Search, Loader2, AlertCircle } from 'lucide-react';
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
  { id: 1, nameKey: 'roles.admin', color: '#3b82f6' },
  { id: 2, nameKey: 'roles.cashier', color: '#10b981' },
  { id: 3, nameKey: 'roles.accountant', color: '#f59e0b' },
  { id: 4, nameKey: 'roles.stockManager', color: '#8b5cf6' },
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

  const { data: usersResponse, isLoading, error } = useQuery({
    queryKey: ['users', searchQuery],
    queryFn: () => userService.getAll({ search: searchQuery }),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateUserData) => userService.create(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || t('common.success'));
        queryClient.invalidateQueries({ queryKey: ['users'] });
        setIsAddOpen(false);
        resetForm();
      } else {
        toast.error(response.message || t('common.error'));
      }
    },
    onError: (error: any) => {
      let message = t('common.error');
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        if (Array.isArray(errors)) {
          message = errors[0];
        } else if (typeof errors === 'object') {
          message = Object.values(errors)[0] as string;
        }
      }
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserData }) => 
      userService.update(id, data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || t('common.success'));
        queryClient.invalidateQueries({ queryKey: ['users'] });
        setIsEditOpen(false);
        setEditingUser(null);
        resetForm();
      } else {
        toast.error(response.message || t('common.error'));
      }
    },
    onError: (error: any) => {
      let message = t('common.error');
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        if (Array.isArray(errors)) {
          message = errors[0];
        } else if (typeof errors === 'object') {
          message = Object.values(errors)[0] as string;
        }
      }
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => userService.delete(id),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || t('common.success'));
        queryClient.invalidateQueries({ queryKey: ['users'] });
        setDeleteUserId(null);
      } else {
        toast.error(response.message || t('common.error'));
      }
    },
    onError: (error: any) => {
      let message = t('common.error');
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        if (Array.isArray(errors)) {
          message = errors[0];
        } else if (typeof errors === 'object') {
          message = Object.values(errors)[0] as string;
        }
      }
      toast.error(message);
      setDeleteUserId(null);
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (id: number) => userService.toggleActive(id),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || t('common.success'));
        queryClient.invalidateQueries({ queryKey: ['users'] });
      } else {
        toast.error(response.message || t('common.error'));
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || t('common.error');
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
    // Validate required fields
    if (!formData.name?.trim()) {
      toast.error(t('common.fullName') + ' ' + t('common.requiredFields'));
      return;
    }
    if (!formData.email?.trim()) {
      toast.error(t('common.email') + ' ' + t('common.requiredFields'));
      return;
    }
    if (!formData.password?.trim()) {
      toast.error(t('auth.password') + ' ' + t('common.requiredFields'));
      return;
    }
    if (!formData.role_id) {
      toast.error(t('common.role') + ' ' + t('common.requiredFields'));
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

    if (!formData.name?.trim()) {
      toast.error(t('common.fullName') + ' ' + t('common.requiredFields'));
      return;
    }
    if (!formData.email?.trim()) {
      toast.error(t('common.email') + ' ' + t('common.requiredFields'));
      return;
    }
    if (!formData.role_id) {
      toast.error(t('common.role') + ' ' + t('common.requiredFields'));
      return;
    }

    const updateData: UpdateUserData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role_id: formData.role_id,
    };

    if (formData.password) {
      updateData.password = formData.password;
    }

    updateMutation.mutate({ id: editingUser.id, data: updateData });
  };

  const handleConfirmDelete = () => {
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
        {role ? t(role.nameKey) : t('common.notSpecified')}
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
          <p className="text-muted-foreground mt-1">{t('people.usersSubtitle')}</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0 gap-2">
              <Plus className="w-4 h-4" />
              {t('people.addUser')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('people.addUser')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>{t('common.fullName')} *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('common.fullNamePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('common.email')} *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@domain.com"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('common.phone')}</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+966XXXXXXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('auth.password')} *</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={t('auth.passwordPlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('common.role')} *</Label>
                <Select
                  value={formData.role_id?.toString()}
                  onValueChange={(value) => setFormData({ ...formData, role_id: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.selectRole')} />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {t(role.nameKey)}
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
                      {t('common.adding')}
                    </>
                  ) : t('common.add')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('common.searchUsers')}
            className="pr-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 text-destructive">
          <AlertCircle className="w-12 h-12" />
          <p>{t('common.errorLoading')}</p>
          <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['users'] })}>
            {t('common.retry')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user: User) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border shadow-sm hover:shadow-md transition-all overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                        {user.name}
                      </h3>
                      {getRoleBadge(user.role_id)}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => handleEdit(user)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteUserId(user.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {user.phone}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-xs font-medium">
                      {user.is_active ? t('common.active') : t('common.inactive')}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => toggleActiveMutation.mutate(user.id)}
                    disabled={toggleActiveMutation.isPending}
                  >
                    {user.is_active ? t('common.deactivate') : t('common.activate')}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('common.editUser')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>{t('common.fullName')} *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('common.email')} *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('common.phone')}</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('auth.password')} ({t('common.leaveEmptyToKeep')})</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('common.role')} *</Label>
              <Select
                value={formData.role_id?.toString()}
                onValueChange={(value) => setFormData({ ...formData, role_id: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {t(role.nameKey)}
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
                    {t('common.saving')}
                  </>
                ) : t('common.save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteUserId} onOpenChange={(open) => !open && setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('common.deleteUserWarning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? t('common.deleting') : t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Users;
