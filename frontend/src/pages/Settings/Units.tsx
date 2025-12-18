import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, Trash2, Ruler, Loader2 } from 'lucide-react';
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
import { useUnits, useCreateUnit, useDeleteUnit } from '@/hooks/useUnits';

const Units: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const [newUnit, setNewUnit] = React.useState({ name: '', name_ar: '', abbreviation: '' });

  // Fetch units from API
  const { data: unitsData, isLoading } = useUnits();
  const createUnit = useCreateUnit();
  const deleteUnit = useDeleteUnit();

  const units = unitsData?.data || [];

  const handleAdd = async () => {
    if (!newUnit.name && !newUnit.name_ar) {
      toast.error('يرجى إدخال اسم الوحدة');
      return;
    }
    if (!newUnit.abbreviation) {
      toast.error('يرجى إدخال الاختصار');
      return;
    }

    try {
      await createUnit.mutateAsync({
        name: newUnit.name || newUnit.name_ar,
        name_ar: newUnit.name_ar || newUnit.name,
        abbreviation: newUnit.abbreviation,
      });
      setNewUnit({ name: '', name_ar: '', abbreviation: '' });
      setIsOpen(false);
      toast.success('تم إضافة الوحدة بنجاح');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في إضافة الوحدة');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه الوحدة؟')) {
      return;
    }

    try {
      await deleteUnit.mutateAsync(id);
      toast.success('تم حذف الوحدة');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في حذف الوحدة');
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
              <DialogTitle>إضافة وحدة قياس جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>الاسم (English)</Label>
                <Input
                  value={newUnit.name}
                  onChange={(e) => setNewUnit({ ...newUnit, name: e.target.value })}
                  placeholder="Kilogram"
                />
              </div>
              <div className="space-y-2">
                <Label>الاسم (عربي)</Label>
                <Input
                  value={newUnit.name_ar}
                  onChange={(e) => setNewUnit({ ...newUnit, name_ar: e.target.value })}
                  placeholder="كيلوجرام"
                />
              </div>
              <div className="space-y-2">
                <Label>الاختصار</Label>
                <Input
                  value={newUnit.abbreviation}
                  onChange={(e) => setNewUnit({ ...newUnit, abbreviation: e.target.value })}
                  placeholder="kg"
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleAdd} disabled={createUnit.isPending}>
                  {createUnit.isPending ? (
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
        {units.map((unit: any, index: number) => (
          <motion.div
            key={unit.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card p-6 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-success/20 to-success/10 flex items-center justify-center">
                  <Ruler className="w-6 h-6 text-success" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-lg">
                    {unit.name_ar || unit.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {unit.abbreviation}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {unit.name !== unit.name_ar && unit.name}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(unit.id)}
                  disabled={deleteUnit.isPending}
                >
                  {deleteUnit.isPending ? (
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

      {units.length === 0 && (
        <div className="text-center py-12">
          <Ruler className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">لا توجد وحدات قياس بعد</p>
          <p className="text-sm text-muted-foreground mt-2">
            ابدأ بإضافة وحدة قياس جديدة باستخدام الزر أعلاه
          </p>
        </div>
      )}
    </div>
  );
};

export default Units;
