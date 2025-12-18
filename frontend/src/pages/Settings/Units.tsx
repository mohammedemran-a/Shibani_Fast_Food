import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Scale } from 'lucide-react';
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

const initialUnits = [
  { id: 1, name: 'قطعة', symbol: 'pc', isBase: true },
  { id: 2, name: 'كرتون', symbol: 'ctn', isBase: false },
  { id: 3, name: 'كيلوجرام', symbol: 'kg', isBase: true },
  { id: 4, name: 'لتر', symbol: 'L', isBase: true },
  { id: 5, name: 'علبة', symbol: 'box', isBase: false },
];

const Units: React.FC = () => {
  const { t } = useTranslation();
  const [units, setUnits] = React.useState(initialUnits);
  const [isOpen, setIsOpen] = React.useState(false);
  const [newUnit, setNewUnit] = React.useState({ name: '', symbol: '' });

  const handleAdd = () => {
    if (!newUnit.name || !newUnit.symbol) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }
    setUnits([...units, { id: Date.now(), ...newUnit, isBase: false }]);
    setNewUnit({ name: '', symbol: '' });
    setIsOpen(false);
    toast.success('تم إضافة الوحدة بنجاح');
  };

  const handleDelete = (id: number) => {
    setUnits(units.filter(u => u.id !== id));
    toast.success('تم حذف الوحدة');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('nav.units')}</h1>
          <p className="text-muted-foreground mt-1">إدارة وحدات القياس</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0 gap-2">
              <Plus className="w-4 h-4" />
              إضافة وحدة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة وحدة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>اسم الوحدة</Label>
                <Input
                  value={newUnit.name}
                  onChange={(e) => setNewUnit({ ...newUnit, name: e.target.value })}
                  placeholder="مثال: كرتون"
                />
              </div>
              <div className="space-y-2">
                <Label>الرمز</Label>
                <Input
                  value={newUnit.symbol}
                  onChange={(e) => setNewUnit({ ...newUnit, symbol: e.target.value })}
                  placeholder="مثال: ctn"
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
              <th className="text-start py-4 px-4 font-medium text-muted-foreground">الوحدة</th>
              <th className="text-start py-4 px-4 font-medium text-muted-foreground">الرمز</th>
              <th className="text-start py-4 px-4 font-medium text-muted-foreground">النوع</th>
              <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {units.map((unit, index) => (
              <motion.tr
                key={unit.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-t border-border hover:bg-muted/30 transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Scale className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">{unit.name}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-muted-foreground font-mono">{unit.symbol}</td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${unit.isBase ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                    {unit.isBase ? 'أساسية' : 'فرعية'}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(unit.id)}>
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

export default Units;
