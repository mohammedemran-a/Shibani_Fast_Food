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
import { useBrands, useCreateBrand, useUpdateBrand, useDeleteBrand } from '@/hooks/useBrands';

const Brands: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isEdit, setIsEdit] = React.useState(false);
  const [currentId, setCurrentId] = React.useState<number | null>(null);
  const [formData, setFormData] = React.useState({ name: '', description: '' });

  // Fetch brands from API
  const { data: brandsData, isLoading } = useBrands();
  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();
  const deleteBrand = useDeleteBrand();

  const brands = brandsData?.data || [];

  const handleOpenAdd = () => {
    setIsEdit(false);
    setCurrentId(null);
    setFormData({ name: '', description: '' });
    setIsOpen(true);
  };

  const handleOpenEdit = (brand: any) => {
    setIsEdit(true);
    setCurrentId(brand.id);
    setFormData({ 
      name: brand.name || '', 
      description: brand.description || '' 
    });
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error(t('common.requiredFields'));
      return;
    }

    try {
      if (isEdit && currentId) {
        await updateBrand.mutateAsync({
          id: currentId,
          data: formData,
        });
        toast.success(t('common.success'));
      } else {
        await createBrand.mutateAsync(formData);
        toast.success(t('common.success'));
      }
      setIsOpen(false);
    } catch (error: any) {
      const message = error.response?.data?.message || t('common.error');
      const errors = error.response?.data?.errors;
      if (errors) {
        const firstError = Object.values(errors)[0] as string[];
        toast.error(`${message}: ${firstError[0]}`);
      } else {
        toast.error(message);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('common.deleteUserWarning'))) {
      return;
    }

    try {
      await deleteBrand.mutateAsync(id);
      toast.success(t('common.success'));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('common.error'));
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
          <p className="text-muted-foreground mt-1">{t('suppliers.subtitle')}</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0 gap-2" onClick={handleOpenAdd}>
              <Plus className="w-4 h-4" />
              {t('common.add')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEdit ? t('common.edit') : t('common.add')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>{t('common.name')} *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('products.selectBrand')}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('common.enterDescription')}</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('common.enterDescription')}
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleSubmit} disabled={createBrand.isPending || updateBrand.isPending}>
                  {(createBrand.isPending || updateBrand.isPending) ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {t('common.saving')}
                    </>
                  ) : (
                    t('common.save')
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
                    {brand.name}
                  </h3>
                  {brand.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {brand.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                  onClick={() => handleOpenEdit(brand)}
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
          <p className="text-muted-foreground">{t('common.noData')}</p>
        </div>
      )}
    </div>
  );
};

export default Brands;
