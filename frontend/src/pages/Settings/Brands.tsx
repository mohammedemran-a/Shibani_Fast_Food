import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Award, Loader2 } from 'lucide-react';
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
import { useBrands, useCreateBrand, useDeleteBrand } from '@/hooks/useBrands';

const Brands: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const [newBrand, setNewBrand] = React.useState({ name: '', name_ar: '', description: '' });

  // Fetch brands from API
  const { data: brandsData, isLoading } = useBrands();
  const createBrand = useCreateBrand();
  const deleteBrand = useDeleteBrand();

  const brands = brandsData?.data || [];

  const handleAdd = async () => {
    if (!newBrand.name && !newBrand.name_ar) {
      toast.error('يرجى إدخال اسم العلامة التجارية');
      return;
    }

    try {
      await createBrand.mutateAsync({
        name: newBrand.name || newBrand.name_ar,
        name_ar: newBrand.name_ar || newBrand.name,
        description: newBrand.description,
      });
      setNewBrand({ name: '', name_ar: '', description: '' });
      setIsOpen(false);
      toast.success('تم إضافة العلامة التجارية بنجاح');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في إضافة العلامة التجارية');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه العلامة التجارية؟')) {
      return;
    }

    try {
      await deleteBrand.mutateAsync(id);
      toast.success('تم حذف العلامة التجارية');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في حذف العلامة التجارية');
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
                <Label>الاسم (English)</Label>
                <Input
                  value={newBrand.name}
                  onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                  placeholder="Samsung"
                />
              </div>
              <div className="space-y-2">
                <Label>الاسم (عربي)</Label>
                <Input
                  value={newBrand.name_ar}
                  onChange={(e) => setNewBrand({ ...newBrand, name_ar: e.target.value })}
                  placeholder="سامسونج"
                />
              </div>
              <div className="space-y-2">
                <Label>الوصف (اختياري)</Label>
                <Input
                  value={newBrand.description}
                  onChange={(e) => setNewBrand({ ...newBrand, description: e.target.value })}
                  placeholder="وصف العلامة التجارية"
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleAdd} disabled={createBrand.isPending}>
                  {createBrand.isPending ? (
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
        {brands.map((brand: any, index: number) => (
          <motion.div
            key={brand.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card p-6 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
                  <Award className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-lg">
                    {brand.name_ar || brand.name}
                  </h3>
                  {brand.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {brand.description}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    {brand.name !== brand.name_ar && brand.name}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                  onClick={() => {
                    setNewBrand({
                      name: brand.name || '',
                      name_ar: brand.name_ar || '',
                      description: brand.description || ''
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
                  onClick={() => handleDelete(brand.id)}
                  disabled={deleteBrand.isPending}
                >
                  {deleteBrand.isPending ? (
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

      {brands.length === 0 && (
        <div className="text-center py-12">
          <Award className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">لا توجد علامات تجارية بعد</p>
          <p className="text-sm text-muted-foreground mt-2">
            ابدأ بإضافة علامة تجارية جديدة باستخدام الزر أعلاه
          </p>
        </div>
      )}
    </div>
  );
};

export default Brands;
