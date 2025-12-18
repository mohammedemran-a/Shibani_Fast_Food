import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Eye, RotateCcw, Trash2 } from 'lucide-react';
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
import { toast } from 'sonner';

const suppliers = [
  { id: 1, name: 'شركة الأغذية المتحدة' },
  { id: 2, name: 'مصنع المشروبات الوطني' },
  { id: 3, name: 'شركة الألبان الطازجة' },
];

const products = [
  { id: 1, name: 'قهوة عربية' },
  { id: 2, name: 'شاي أخضر' },
  { id: 3, name: 'عصير برتقال' },
  { id: 4, name: 'بسكويت شوكولاتة' },
  { id: 5, name: 'حليب طازج' },
];

const initialReturnsData = [
  { id: 'RET-001', supplierId: 1, supplierName: 'شركة الأغذية المتحدة', productId: 1, productName: 'قهوة عربية', originalInvoice: 'PUR-001', originalDate: '2024-01-10', returnDate: '2024-01-15', quantity: 5, amount: 50.00, reason: 'منتج تالف', status: 'completed' },
  { id: 'RET-002', supplierId: 2, supplierName: 'مصنع المشروبات الوطني', productId: 3, productName: 'عصير برتقال', originalInvoice: 'PUR-002', originalDate: '2024-01-08', returnDate: '2024-01-14', quantity: 10, amount: 120.00, reason: 'خطأ في الطلب', status: 'pending' },
  { id: 'RET-003', supplierId: 3, supplierName: 'شركة الألبان الطازجة', productId: 5, productName: 'حليب طازج', originalInvoice: 'PUR-003', originalDate: '2024-01-05', returnDate: '2024-01-13', quantity: 3, amount: 35.00, reason: 'انتهاء الصلاحية', status: 'completed' },
];

const Returns: React.FC = () => {
  const { t } = useTranslation();
  const [returns, setReturns] = React.useState(initialReturnsData);
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [newReturn, setNewReturn] = React.useState({
    supplierId: '',
    productId: '',
    originalInvoice: '',
    originalDate: '',
    quantity: 1,
    amount: 0,
    reason: '',
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-success/10 text-success',
      pending: 'bg-warning/10 text-warning',
      rejected: 'bg-destructive/10 text-destructive',
    };
    const labels = {
      completed: t('common.completed'),
      pending: t('common.pending'),
      rejected: t('common.rejected'),
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const handleAdd = () => {
    if (!newReturn.supplierId || !newReturn.productId || !newReturn.originalInvoice) {
      toast.error(t('returns.fillRequired'));
      return;
    }
    
    const supplier = suppliers.find(s => s.id.toString() === newReturn.supplierId);
    const product = products.find(p => p.id.toString() === newReturn.productId);
    
    const newReturnItem = {
      id: `RET-${String(returns.length + 1).padStart(3, '0')}`,
      supplierId: parseInt(newReturn.supplierId),
      supplierName: supplier?.name || '',
      productId: parseInt(newReturn.productId),
      productName: product?.name || '',
      originalInvoice: newReturn.originalInvoice,
      originalDate: newReturn.originalDate,
      returnDate: new Date().toISOString().split('T')[0],
      quantity: newReturn.quantity,
      amount: newReturn.amount,
      reason: newReturn.reason,
      status: 'pending',
    };
    
    setReturns([newReturnItem, ...returns]);
    setNewReturn({
      supplierId: '',
      productId: '',
      originalInvoice: '',
      originalDate: '',
      quantity: 1,
      amount: 0,
      reason: '',
    });
    setIsOpen(false);
    toast.success(t('returns.added'));
  };

  const handleDelete = (id: string) => {
    setReturns(returns.filter(r => r.id !== id));
    toast.success(t('returns.deleted'));
  };

  const filteredReturns = returns.filter(r =>
    r.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('nav.returns')}</h1>
          <p className="text-muted-foreground mt-1">{t('returns.manage')}</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0 gap-2">
              <Plus className="w-4 h-4" />
              {t('returns.addReturn')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t('returns.addReturn')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('purchases.supplier')} *</Label>
                  <Select onValueChange={(value) => setNewReturn({ ...newReturn, supplierId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('purchases.selectSupplier')} />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map(supplier => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('products.name')} *</Label>
                  <Select onValueChange={(value) => setNewReturn({ ...newReturn, productId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('purchases.selectProduct')} />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(product => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('returns.originalInvoice')} *</Label>
                  <Input
                    value={newReturn.originalInvoice}
                    onChange={(e) => setNewReturn({ ...newReturn, originalInvoice: e.target.value })}
                    placeholder="PUR-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('returns.originalDate')}</Label>
                  <Input
                    type="date"
                    value={newReturn.originalDate}
                    onChange={(e) => setNewReturn({ ...newReturn, originalDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('returns.quantity')}</Label>
                  <Input
                    type="number"
                    min="1"
                    value={newReturn.quantity}
                    onChange={(e) => setNewReturn({ ...newReturn, quantity: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('returns.amount')}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newReturn.amount}
                    onChange={(e) => setNewReturn({ ...newReturn, amount: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('returns.reason')}</Label>
                <Input
                  value={newReturn.reason}
                  onChange={(e) => setNewReturn({ ...newReturn, reason: e.target.value })}
                  placeholder={t('returns.reasonPlaceholder')}
                />
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
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder={t('common.search')} 
              className="ps-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            {t('common.filter')}
          </Button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('returns.returnId')}</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('purchases.supplier')}</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('products.name')}</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('returns.originalInvoice')}</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('returns.quantity')}</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('returns.amount')}</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('returns.reason')}</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('common.status')}</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredReturns.map((ret, index) => (
                <motion.tr
                  key={ret.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-t border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-accent" />
                      <span className="font-mono text-primary">{ret.id}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-medium text-foreground">{ret.supplierName}</td>
                  <td className="py-4 px-4 text-muted-foreground">{ret.productName}</td>
                  <td className="py-4 px-4 font-mono text-muted-foreground">{ret.originalInvoice}</td>
                  <td className="py-4 px-4 text-muted-foreground">{ret.quantity}</td>
                  <td className="py-4 px-4 font-semibold text-destructive">-${ret.amount.toFixed(2)}</td>
                  <td className="py-4 px-4 text-muted-foreground">{ret.reason}</td>
                  <td className="py-4 px-4">{getStatusBadge(ret.status)}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(ret.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filteredReturns.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-muted-foreground">
                    {t('common.noData')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Returns;
