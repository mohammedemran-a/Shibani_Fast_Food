import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, UserCog, Shield, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const roles = [
  { id: 'admin', name: 'مدير', color: '#3b82f6' },
  { id: 'cashier', name: 'كاشير', color: '#10b981' },
  { id: 'accountant', name: 'محاسب', color: '#f59e0b' },
  { id: 'inventory', name: 'مدير المخزون', color: '#8b5cf6' },
];

const initialUsers = [
  { id: 1, name: 'أحمد محمد', email: 'ahmed@pos.com', phone: '+966501234567', role: 'admin', status: 'active' },
  { id: 2, name: 'سارة علي', email: 'sara@pos.com', phone: '+966502345678', role: 'cashier', status: 'active' },
  { id: 3, name: 'محمد خالد', email: 'mohammed@pos.com', phone: '+966503456789', role: 'accountant', status: 'active' },
  { id: 4, name: 'فاطمة أحمد', email: 'fatima@pos.com', phone: '+966504567890', role: 'inventory', status: 'inactive' },
];

const Users: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = React.useState(initialUsers);
  const [isOpen, setIsOpen] = React.useState(false);
  const [newUser, setNewUser] = React.useState({ name: '', email: '', phone: '', role: '' });
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleAdd = () => {
    if (!newUser.name || !newUser.email || !newUser.role) {
      toast.error('يرجى ملء الحقول المطلوبة');
      return;
    }
    setUsers([...users, { id: Date.now(), ...newUser, status: 'active' }]);
    setNewUser({ name: '', email: '', phone: '', role: '' });
    setIsOpen(false);
    toast.success('تم إضافة المستخدم بنجاح');
  };

  const handleDelete = (id: number) => {
    if (users.find(u => u.id === id)?.role === 'admin' && users.filter(u => u.role === 'admin').length <= 1) {
      toast.error('لا يمكن حذف آخر مدير في النظام');
      return;
    }
    setUsers(users.filter(u => u.id !== id));
    toast.success('تم حذف المستخدم');
  };

  const getRoleBadge = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return (
      <span 
        className="px-2 py-1 rounded-full text-xs font-medium"
        style={{ backgroundColor: role?.color + '20', color: role?.color }}
      >
        {role?.name}
      </span>
    );
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('nav.users')}</h1>
          <p className="text-muted-foreground mt-1">إدارة مستخدمي النظام</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="الاسم الكامل"
                />
              </div>
              <div className="space-y-2">
                <Label>البريد الإلكتروني *</Label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>رقم الهاتف</Label>
                <Input
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  placeholder="+966XXXXXXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label>الدور *</Label>
                <Select onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الدور" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleAdd} className="gradient-primary border-0">
                  {t('common.add')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">المستخدم</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">البريد الإلكتروني</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">الهاتف</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">الدور</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('common.status')}</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-t border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                        <UserCog className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <span className="font-medium text-foreground">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>{user.email}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{user.phone}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">{getRoleBadge(user.role)}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                      {user.status === 'active' ? t('common.active') : t('common.inactive')}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive" 
                        onClick={() => handleDelete(user.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
