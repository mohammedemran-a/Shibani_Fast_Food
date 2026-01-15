import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Tags, Loader2 } from 'lucide-react';
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
import { useCategories, useCreateCategory, useDeleteCategory } from '@/hooks/useCategories';

const Categories: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const [newCategory, setNewCategory] = React.useState({ name: '', name_ar: '', description: '' });

  // Fetch categories from API
  const { data: categoriesData, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();

  const categories = categoriesData?.data || [];

  const handleAdd = async () => {
    if (!newCategory.name || !newCategory.name_ar) {
      toast.error('يرجى إدخال اسم الفئة بالعربية والإنجليزية');
      return;
    }

    try {
      await createCategory.mutateAsync({
        name: newCategory.name,
        name_ar: newCategory.name_ar,
        description: newCategory.description,
      });
      setNewCategory({ name: '', name_ar: '', description: '' });
      setIsOpen(false);
      toast.success('تم إضافة الفئة بنجاح');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في إضافة الفئة');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه الفئة؟')) {
      return;
    }

    try {
      await deleteCategory.mutateAsync(id);
      toast.success('تم حذف الفئة');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في حذف الفئة');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
                <Label>الاسم (بالعربية)</Label>
                <Input
                  value={newCategory.name_ar}
                  onChange={(e) => setNewCategory({ ...newCategory, name_ar: e.target.value })}
                  placeholder="إلكترونيات"
                />
              </div>

              <div className="space-y-2">
                <Label>الاسم (English)</Label>
                <Input
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="Electronics"
                />
              </div>

              <div className="space-y-2">
                <Label>الوصف (اختياري)</Label>
                <Input
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder="وصف الفئة"
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleAdd} disabled={createCategory.isPending}>
                  {createCategory.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      جاري الإضافة...
                    </>
                  ) : (
                    'إضافة'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category: any, index: number) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card p-6 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Tags className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-lg">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {category.description}
                    </p>
                  )}

                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                  onClick={() => {
                    setNewCategory({
                      name: category.name || '',
                      name_ar: category.name_ar || '',
                      description: category.description || ''
                    });
                    setIsOpen(true);
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(category.id)}
                  disabled={deleteCategory.isPending}
                >
                  {deleteCategory.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <Tags className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">لا توجد فئات بعد</p>
          <p className="text-sm text-muted-foreground mt-2">
            ابدأ بإضافة فئة جديدة باستخدام الزر أعلاه
          </p>
        </div>
      )}
    </div>
  );
};

export default Categories;
