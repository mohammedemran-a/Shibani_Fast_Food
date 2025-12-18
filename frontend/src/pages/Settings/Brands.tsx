import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Bookmark } from 'lucide-react';
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

const initialBrands = [
  { id: 1, name: 'المراعي', productsCount: 15, country: 'السعودية' },
  { id: 2, name: 'ندى', productsCount: 12, country: 'السعودية' },
  { id: 3, name: 'نستله', productsCount: 20, country: 'سويسرا' },
  { id: 4, name: 'ليبتون', productsCount: 8, country: 'المملكة المتحدة' },
  { id: 5, name: 'أوريو', productsCount: 5, country: 'أمريكا' },
];

const Brands: React.FC = () => {
  const { t } = useTranslation();
  const [brands, setBrands] = React.useState(initialBrands);
  const [isOpen, setIsOpen] = React.useState(false);
  const [newBrand, setNewBrand] = React.useState({ name: '', country: '' });

  const handleAdd = () => {
    if (!newBrand.name) {
      toast.error('يرجى إدخال اسم العلامة التجارية');
      return;
    }
    setBrands([...brands, { id: Date.now(), ...newBrand, productsCount: 0 }]);
    setNewBrand({ name: '', country: '' });
    setIsOpen(false);
    toast.success('تم إضافة العلامة التجارية بنجاح');
  };

  const handleDelete = (id: number) => {
    setBrands(brands.filter(b => b.id !== id));
    toast.success('تم حذف العلامة التجارية');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('nav.brands')}</h1>
          <p className="text-muted-foreground mt-1">إدارة العلامات التجارية</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0 gap-2">
              <Plus className="w-4 h-4" />
              إضافة علامة تجارية
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة علامة تجارية جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>اسم العلامة التجارية</Label>
                <Input
                  value={newBrand.name}
                  onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                  placeholder="مثال: سامسونج"
                />
              </div>
              <div className="space-y-2">
                <Label>بلد المنشأ</Label>
                <Input
                  value={newBrand.country}
                  onChange={(e) => setNewBrand({ ...newBrand, country: e.target.value })}
                  placeholder="مثال: كوريا الجنوبية"
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
              <th className="text-start py-4 px-4 font-medium text-muted-foreground">العلامة التجارية</th>
              <th className="text-start py-4 px-4 font-medium text-muted-foreground">بلد المنشأ</th>
              <th className="text-start py-4 px-4 font-medium text-muted-foreground">عدد المنتجات</th>
              <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((brand, index) => (
              <motion.tr
                key={brand.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-t border-border hover:bg-muted/30 transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Bookmark className="w-4 h-4 text-accent" />
                    </div>
                    <span className="font-medium text-foreground">{brand.name}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-muted-foreground">{brand.country}</td>
                <td className="py-4 px-4 text-muted-foreground">{brand.productsCount} منتج</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(brand.id)}>
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

export default Brands;
