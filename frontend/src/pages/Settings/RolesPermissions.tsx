import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Trash2, Shield, Save, Check, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { roleService, type Role, type Permission } from '@/api/roleService';

const RolesPermissions: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', name_ar: '', description: '' });
  const [editedPermissions, setEditedPermissions] = useState<number[]>([]);

  // Fetch roles
  const { data: rolesResponse, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: () => roleService.getAll(),
  });

  // Fetch permissions
  const { data: permissionsResponse, isLoading: isLoadingPermissions } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => roleService.getAllPermissions(),
  });

  useEffect(() => {
    if (selectedRole) {
      setEditedPermissions(selectedRole.permissions.map(p => p.id));
    }
  }, [selectedRole]);

  const createRoleMutation = useMutation({
    mutationFn: (data: any) => roleService.create(data),
    onSuccess: () => {
      toast.success(t('common.success'));
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setIsAddOpen(false);
      setNewRole({ name: '', name_ar: '', description: '' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('common.error'));
    }
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: ({ id, permissions }: { id: number, permissions: number[] }) => 
      roleService.updatePermissions(id, permissions),
    onSuccess: () => {
      toast.success(t('common.success'));
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('common.error'));
    }
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (id: number) => roleService.delete(id),
    onSuccess: () => {
      toast.success(t('common.success'));
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setSelectedRole(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('common.error'));
    }
  });

  const handleTogglePermission = (permissionId: number) => {
    setEditedPermissions(prev => 
      prev.includes(permissionId) 
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSavePermissions = () => {
    if (!selectedRole) return;
    updatePermissionsMutation.mutate({ 
      id: selectedRole.id, 
      permissions: editedPermissions 
    });
  };

  const handleAddRole = () => {
    if (!newRole.name || !newRole.name_ar) {
      toast.error(t('common.requiredFields'));
      return;
    }
    createRoleMutation.mutate(newRole);
  };

  const roles = rolesResponse?.data || [];
  const permissions = permissionsResponse?.data || [];

  // Group permissions by module
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (isLoadingRoles || isLoadingPermissions) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('nav.roles')}</h1>
          <p className="text-muted-foreground mt-1">إدارة أدوار المستخدمين وصلاحياتهم</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0 gap-2">
              <Plus className="w-4 h-4" />
              إضافة دور جديد
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة دور جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>اسم الدور (EN)</Label>
                <Input
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  placeholder="مثال: Admin"
                />
              </div>
              <div className="space-y-2">
                <Label>اسم الدور (AR)</Label>
                <Input
                  value={newRole.name_ar}
                  onChange={(e) => setNewRole({ ...newRole, name_ar: e.target.value })}
                  placeholder="مثال: مدير"
                />
              </div>
              <div className="space-y-2">
                <Label>الوصف</Label>
                <Input
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  placeholder="وصف مختصر للدور"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button 
                  onClick={handleAddRole} 
                  className="gradient-primary border-0"
                  disabled={createRoleMutation.isPending}
                >
                  {createRoleMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t('common.add')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Roles List */}
        <div className="lg:col-span-1">
          <div className="glass-card p-4">
            <h3 className="font-semibold text-foreground mb-4">الأدوار</h3>
            <div className="space-y-2">
              {roles.map((role) => (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    'p-3 rounded-lg cursor-pointer transition-all border-2',
                    selectedRole?.id === role.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-transparent hover:bg-muted/50'
                  )}
                  onClick={() => setSelectedRole(role)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10">
                        <Shield className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{role.name_ar || role.name}</p>
                        <p className="text-xs text-muted-foreground">{role.permissions.length} صلاحية</p>
                      </div>
                    </div>
                    {role.id !== 1 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          if(confirm('هل أنت متأكد من حذف هذا الدور؟')) deleteRoleMutation.mutate(role.id); 
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div className="lg:col-span-2">
          <div className="glass-card p-5">
            {selectedRole ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">
                      صلاحيات: {selectedRole.name_ar || selectedRole.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{selectedRole.description}</p>
                  </div>
                  <Button 
                    onClick={handleSavePermissions} 
                    className="gradient-primary border-0 gap-2"
                    disabled={updatePermissionsMutation.isPending}
                  >
                    {updatePermissionsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    حفظ التغييرات
                  </Button>
                </div>

                <div className="space-y-6">
                  {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                    <div key={module}>
                      <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        {module}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {modulePermissions.map((permission) => (
                          <label
                            key={permission.id}
                            className={cn(
                              'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                              editedPermissions.includes(permission.id)
                                ? 'border-primary/50 bg-primary/5'
                                : 'border-border hover:border-muted-foreground/30'
                            )}
                          >
                            <Checkbox
                              checked={editedPermissions.includes(permission.id)}
                              onCheckedChange={() => handleTogglePermission(permission.id)}
                            />
                            <span className="text-sm text-foreground">{permission.name_ar || permission.name}</span>
                            {editedPermissions.includes(permission.id) && (
                              <Check className="w-4 h-4 text-primary ms-auto" />
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Shield className="w-16 h-16 mb-4 opacity-30" />
                <p>اختر دوراً من القائمة لعرض وتعديل صلاحياته</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolesPermissions;
