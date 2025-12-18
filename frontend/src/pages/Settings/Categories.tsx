import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Tags } from 'lucide-react';
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

const initialCategories = [
  { id: 1, name: 'مشروبات', productsCount: 25, color: '#3b82f6' },
  { id: 2, name: 'وجبات خفيفة', productsCount: 18, color: '#f59e0b' },
  { id: 3, name: 'منتجات ألبان', productsCount: 12, color: '#10b981' },
  { id: 4, name: 'مخبوزات', productsCount: 8, color: '#ef4444' },
  { id: 5, name: 'معلبات', productsCount: 15, color: '#8b5cf6' },
];

const Categories: React.FC = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = React.useState(initialCategories);
  const [isOpen, setIsOpen] = React.useState(false);
  const [newCategory, setNewCategory] = React.useState({ name: '', color: '#3b82f6' });

  const handleAdd = () => {
    if (!newCategory.name) {
      toast.error('يرجى إدخال اسم الفئة');
      return;
    }
    setCategories([...categories, { id: Date.now(), ...newCategory, productsCount: 0 }]);
    setNewCategory({ name: '', color: '#3b82f6' });
    setIsOpen(false);
    toast.success('تم إضافة الفئة بنجاح');
  };

  const handleDelete = (id: number) => {
    setCategories(categories.filter(c => c.id !== id));
    toast.success('تم حذف الفئة');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('nav.categories')}</h1>
          <p className="text-muted-foreground mt-1">إدارة فئات المنتجات</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0 gap-2">
              <Plus className="w-4 h-4" />
              إضافة فئة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة فئة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>اسم الفئة</Label>
                <Input
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="مثال: إلكترونيات"
                />
              </div>
              <div className="space-y-2">
                <Label>اللون</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
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
              <th className="text-start py-4 px-4 font-medium text-muted-foreground">الفئة</th>
              <th className="text-start py-4 px-4 font-medium text-muted-foreground">عدد المنتجات</th>
              <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category, index) => (
              <motion.tr
                key={category.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-t border-border hover:bg-muted/30 transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: category.color + '20' }}>
                      <Tags className="w-4 h-4" style={{ color: category.color }} />
                    </div>
                    <span className="font-medium text-foreground">{category.name}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-muted-foreground">{category.productsCount} منتج</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(category.id)}>
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

export default Categories;
