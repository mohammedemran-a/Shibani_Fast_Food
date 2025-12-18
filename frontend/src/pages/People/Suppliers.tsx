import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Truck, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Supplier {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  totalPurchases: number;
}

const initialSuppliers: Supplier[] = [
  { id: 1, name: 'شركة الأغذية المتحدة', phone: '+966501234567', email: 'info@united-foods.com', address: 'الرياض، السعودية', totalPurchases: 15000 },
  { id: 2, name: 'مصنع المشروبات الوطني', phone: '+966502345678', email: 'sales@national-drinks.com', address: 'جدة، السعودية', totalPurchases: 12500 },
  { id: 3, name: 'شركة الألبان الطازجة', phone: '+966503456789', email: 'orders@fresh-dairy.com', address: 'الدمام، السعودية', totalPurchases: 8900 },
];

const Suppliers: React.FC = () => {
  const { t } = useTranslation();
  const [suppliers, setSuppliers] = React.useState<Supplier[]>(initialSuppliers);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [editingSupplier, setEditingSupplier] = React.useState<Supplier | null>(null);
  const [newSupplier, setNewSupplier] = React.useState({ name: '', phone: '', email: '', address: '' });
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleAdd = () => {
    if (!newSupplier.name || !newSupplier.phone) {
      toast.error(t('suppliers.requiredFields'));
      return;
    }
    setSuppliers([...suppliers, { id: Date.now(), ...newSupplier, totalPurchases: 0 }]);
    setNewSupplier({ name: '', phone: '', email: '', address: '' });
    setIsAddOpen(false);
    toast.success(t('suppliers.addSuccess'));
  };

  const handleEdit = () => {
    if (!editingSupplier || !editingSupplier.name || !editingSupplier.phone) {
      toast.error(t('suppliers.requiredFields'));
      return;
    }
    setSuppliers(suppliers.map(s => s.id === editingSupplier.id ? editingSupplier : s));
    setIsEditOpen(false);
    setEditingSupplier(null);
    toast.success(t('suppliers.editSuccess'));
  };

  const openEditDialog = (supplier: Supplier) => {
    setEditingSupplier({ ...supplier });
    setIsEditOpen(true);
  };

  const handleDelete = (id: number) => {
    setSuppliers(suppliers.filter(s => s.id !== id));
    toast.success(t('suppliers.deleteSuccess'));
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('suppliers.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('suppliers.subtitle')}</p>
        </div>
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
                  value={newSupplier.email}
                  onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                  placeholder="email@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('suppliers.address')}</Label>
                <Input
                  value={newSupplier.address}
                  onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                  placeholder={t('suppliers.address')}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
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

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('suppliers.editSupplier')}</DialogTitle>
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
                  value={editingSupplier.email}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, email: e.target.value })}
                  placeholder="email@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('suppliers.address')}</Label>
                <Input
                  value={editingSupplier.address}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, address: e.target.value })}
                  placeholder={t('suppliers.address')}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleEdit} className="gradient-primary border-0">
                  {t('common.save')}
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredSuppliers.map((supplier, index) => (
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
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(supplier)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(supplier.id)}>
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
              <p className="text-xl font-bold text-primary">${supplier.totalPurchases.toLocaleString()}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Suppliers;