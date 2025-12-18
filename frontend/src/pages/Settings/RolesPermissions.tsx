import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Shield, Save, Check } from 'lucide-react';
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

const allPermissions = [
  { id: 'dashboard_view', name: 'عرض لوحة التحكم', category: 'لوحة التحكم' },
  { id: 'pos_access', name: 'الوصول لنقطة البيع', category: 'نقطة البيع' },
  { id: 'pos_discount', name: 'تطبيق الخصومات', category: 'نقطة البيع' },
  { id: 'pos_refund', name: 'إجراء المرتجعات', category: 'نقطة البيع' },
  { id: 'products_view', name: 'عرض المنتجات', category: 'المنتجات' },
  { id: 'products_add', name: 'إضافة منتجات', category: 'المنتجات' },
  { id: 'products_edit', name: 'تعديل المنتجات', category: 'المنتجات' },
  { id: 'products_delete', name: 'حذف المنتجات', category: 'المنتجات' },
  { id: 'sales_view', name: 'عرض المبيعات', category: 'المبيعات' },
  { id: 'sales_add', name: 'إضافة مبيعات', category: 'المبيعات' },
  { id: 'purchases_view', name: 'عرض المشتريات', category: 'المشتريات' },
  { id: 'purchases_add', name: 'إضافة مشتريات', category: 'المشتريات' },
  { id: 'reports_view', name: 'عرض التقارير', category: 'التقارير' },
  { id: 'reports_export', name: 'تصدير التقارير', category: 'التقارير' },
  { id: 'customers_view', name: 'عرض العملاء', category: 'الأشخاص' },
  { id: 'customers_manage', name: 'إدارة العملاء', category: 'الأشخاص' },
  { id: 'suppliers_view', name: 'عرض الموردين', category: 'الأشخاص' },
  { id: 'suppliers_manage', name: 'إدارة الموردين', category: 'الأشخاص' },
  { id: 'users_view', name: 'عرض المستخدمين', category: 'المستخدمين' },
  { id: 'users_manage', name: 'إدارة المستخدمين', category: 'المستخدمين' },
  { id: 'settings_view', name: 'عرض الإعدادات', category: 'الإعدادات' },
  { id: 'settings_manage', name: 'تعديل الإعدادات', category: 'الإعدادات' },
  { id: 'roles_manage', name: 'إدارة الأدوار', category: 'الإعدادات' },
];

const initialRoles = [
  { 
    id: 1, 
    name: 'مدير', 
    description: 'صلاحيات كاملة للنظام',
    color: '#3b82f6',
    permissions: allPermissions.map(p => p.id)
  },
  { 
    id: 2, 
    name: 'كاشير', 
    description: 'صلاحيات نقطة البيع فقط',
    color: '#10b981',
    permissions: ['dashboard_view', 'pos_access', 'products_view', 'customers_view']
  },
  { 
    id: 3, 
    name: 'محاسب', 
    description: 'صلاحيات المالية والتقارير',
    color: '#f59e0b',
    permissions: ['dashboard_view', 'sales_view', 'purchases_view', 'reports_view', 'reports_export']
  },
  { 
    id: 4, 
    name: 'مدير المخزون', 
    description: 'إدارة المنتجات والمخزون',
    color: '#8b5cf6',
    permissions: ['dashboard_view', 'products_view', 'products_add', 'products_edit', 'purchases_view', 'purchases_add', 'suppliers_view']
  },
];

const RolesPermissions: React.FC = () => {
  const { t } = useTranslation();
  const [roles, setRoles] = React.useState(initialRoles);
  const [selectedRole, setSelectedRole] = React.useState<typeof initialRoles[0] | null>(null);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [newRole, setNewRole] = React.useState({ name: '', description: '', color: '#3b82f6' });
  const [editedPermissions, setEditedPermissions] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (selectedRole) {
      setEditedPermissions(selectedRole.permissions);
    }
  }, [selectedRole]);

  const handleSelectRole = (role: typeof initialRoles[0]) => {
    setSelectedRole(role);
    setEditedPermissions(role.permissions);
  };

  const handleTogglePermission = (permissionId: string) => {
    setEditedPermissions(prev => 
      prev.includes(permissionId) 
        ? prev.filter(p => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSavePermissions = () => {
    if (!selectedRole) return;
    setRoles(roles.map(r => 
      r.id === selectedRole.id 
        ? { ...r, permissions: editedPermissions }
        : r
    ));
    toast.success('تم حفظ التغييرات بنجاح');
  };

  const handleAddRole = () => {
    if (!newRole.name) {
      toast.error('يرجى إدخال اسم الدور');
      return;
    }
    const role = {
      id: Date.now(),
      ...newRole,
      permissions: []
    };
    setRoles([...roles, role]);
    setNewRole({ name: '', description: '', color: '#3b82f6' });
    setIsAddOpen(false);
    setSelectedRole(role);
    toast.success('تم إضافة الدور بنجاح');
  };

  const handleDeleteRole = (id: number) => {
    if (id === 1) {
      toast.error('لا يمكن حذف دور المدير');
      return;
    }
    setRoles(roles.filter(r => r.id !== id));
    if (selectedRole?.id === id) setSelectedRole(null);
    toast.success('تم حذف الدور');
  };

  const groupedPermissions = allPermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, typeof allPermissions>);

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
                <Label>اسم الدور</Label>
                <Input
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  placeholder="مثال: مشرف"
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
              <div className="space-y-2">
                <Label>اللون</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={newRole.color}
                    onChange={(e) => setNewRole({ ...newRole, color: e.target.value })}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={newRole.color}
                    onChange={(e) => setNewRole({ ...newRole, color: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleAddRole} className="gradient-primary border-0">
                  {t('common.add')}
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
                  onClick={() => handleSelectRole(role)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: role.color + '20' }}
                      >
                        <Shield className="w-5 h-5" style={{ color: role.color }} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{role.name}</p>
                        <p className="text-xs text-muted-foreground">{role.permissions.length} صلاحية</p>
                      </div>
                    </div>
                    {role.id !== 1 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); handleDeleteRole(role.id); }}
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
                      صلاحيات: {selectedRole.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{selectedRole.description}</p>
                  </div>
                  <Button onClick={handleSavePermissions} className="gradient-primary border-0 gap-2">
                    <Save className="w-4 h-4" />
                    حفظ التغييرات
                  </Button>
                </div>

                <div className="space-y-6">
                  {Object.entries(groupedPermissions).map(([category, permissions]) => (
                    <div key={category}>
                      <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        {category}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {permissions.map((permission) => (
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
                            <span className="text-sm text-foreground">{permission.name}</span>
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
