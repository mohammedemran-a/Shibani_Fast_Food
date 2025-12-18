import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Coins } from 'lucide-react';
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
import { toast } from 'sonner';

const initialCurrencies = [
  { id: 1, name: 'دولار أمريكي', code: 'USD', symbol: '$', rate: 1.00, isDefault: true },
  { id: 2, name: 'ريال سعودي', code: 'SAR', symbol: 'ر.س', rate: 3.75, isDefault: false },
  { id: 3, name: 'درهم إماراتي', code: 'AED', symbol: 'د.إ', rate: 3.67, isDefault: false },
  { id: 4, name: 'جنيه مصري', code: 'EGP', symbol: 'ج.م', rate: 30.90, isDefault: false },
];

const Currencies: React.FC = () => {
  const { t } = useTranslation();
  const [currencies, setCurrencies] = React.useState(initialCurrencies);
  const [isOpen, setIsOpen] = React.useState(false);
  const [newCurrency, setNewCurrency] = React.useState({ name: '', code: '', symbol: '', rate: '' });

  const handleAdd = () => {
    if (!newCurrency.name || !newCurrency.code || !newCurrency.symbol) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }
    setCurrencies([...currencies, { 
      id: Date.now(), 
      ...newCurrency, 
      rate: parseFloat(newCurrency.rate) || 1,
      isDefault: false 
    }]);
    setNewCurrency({ name: '', code: '', symbol: '', rate: '' });
    setIsOpen(false);
    toast.success('تم إضافة العملة بنجاح');
  };

  const handleDelete = (id: number) => {
    const currency = currencies.find(c => c.id === id);
    if (currency?.isDefault) {
      toast.error('لا يمكن حذف العملة الافتراضية');
      return;
    }
    setCurrencies(currencies.filter(c => c.id !== id));
    toast.success('تم حذف العملة');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('nav.currencies')}</h1>
          <p className="text-muted-foreground mt-1">إدارة العملات وأسعار الصرف</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0 gap-2">
              <Plus className="w-4 h-4" />
              إضافة عملة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة عملة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>اسم العملة</Label>
                <Input
                  value={newCurrency.name}
                  onChange={(e) => setNewCurrency({ ...newCurrency, name: e.target.value })}
                  placeholder="مثال: يورو"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الرمز الدولي</Label>
                  <Input
                    value={newCurrency.code}
                    onChange={(e) => setNewCurrency({ ...newCurrency, code: e.target.value.toUpperCase() })}
                    placeholder="EUR"
                    maxLength={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الرمز</Label>
                  <Input
                    value={newCurrency.symbol}
                    onChange={(e) => setNewCurrency({ ...newCurrency, symbol: e.target.value })}
                    placeholder="€"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>سعر الصرف (مقابل الدولار)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newCurrency.rate}
                  onChange={(e) => setNewCurrency({ ...newCurrency, rate: e.target.value })}
                  placeholder="0.92"
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

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-start py-4 px-4 font-medium text-muted-foreground">العملة</th>
              <th className="text-start py-4 px-4 font-medium text-muted-foreground">الرمز</th>
              <th className="text-start py-4 px-4 font-medium text-muted-foreground">سعر الصرف</th>
              <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('common.status')}</th>
              <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {currencies.map((currency, index) => (
              <motion.tr
                key={currency.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-t border-border hover:bg-muted/30 transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                      <Coins className="w-4 h-4 text-warning" />
                    </div>
                    <div>
                      <span className="font-medium text-foreground block">{currency.name}</span>
                      <span className="text-xs text-muted-foreground">{currency.code}</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-xl font-bold text-foreground">{currency.symbol}</td>
                <td className="py-4 px-4 text-muted-foreground font-mono">{currency.rate.toFixed(2)}</td>
                <td className="py-4 px-4">
                  {currency.isDefault && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      افتراضية
                    </span>
                  )}
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
                      onClick={() => handleDelete(currency.id)}
                      disabled={currency.isDefault}
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
  );
};

export default Currencies;
