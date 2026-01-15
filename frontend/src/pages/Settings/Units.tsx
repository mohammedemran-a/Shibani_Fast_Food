import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Ruler, Loader2, ChevronRight } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useUnits, useCreateUnit, useUpdateUnit, useDeleteUnit } from '@/hooks/useUnits';

interface Unit {
  id: number;
  name: string;
  abbreviation: string;
  parent_unit_id?: number | null;
  conversion_factor?: number | null;
  parent_unit?: Unit | null;
  sub_units?: Unit[];
}

const Units: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [newUnit, setNewUnit] = React.useState({ 
    name: '', 
    name_ar: '',
    abbreviation: '',
    parent_unit_id: '',
    conversion_factor: ''
  });

  // Fetch units from API
  const { data: unitsData, isLoading } = useUnits();
  const createUnit = useCreateUnit();
  const updateUnit = useUpdateUnit();
  const deleteUnit = useDeleteUnit();

  const units: Unit[] = unitsData?.data || [];
  
  // Get parent units (units without parent)
  const parentUnits = units.filter((u: Unit) => !u.parent_unit_id);

  const handleSubmit = async () => {
    if (!newUnit.name || !newUnit.name_ar) {
      toast.error('يرجى إدخال اسم الوحدة بالعربية والإنجليزية');
      return;
    }
    if (!newUnit.abbreviation) {
      toast.error('يرجى إدخال الاختصار');
      return;
    }

    const data: any = {
      name: newUnit.name,
      name_ar: newUnit.name_ar,
      abbreviation: newUnit.abbreviation,
    };

    // Add parent unit if selected
    if (newUnit.parent_unit_id && newUnit.parent_unit_id !== 'none') {
      data.parent_unit_id = parseInt(newUnit.parent_unit_id);
      data.conversion_factor = newUnit.conversion_factor ? parseFloat(newUnit.conversion_factor) : 1;
    } else {
      data.parent_unit_id = null;
      data.conversion_factor = null;
    }

    try {
      if (editingId) {
        await updateUnit.mutateAsync({ id: editingId, data });
        toast.success('تم تحديث الوحدة بنجاح');
      } else {
        await createUnit.mutateAsync(data);
        toast.success('تم إضافة الوحدة بنجاح');
      }
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في حفظ الوحدة');
    }
  };

  const resetForm = () => {
    setNewUnit({ name: '', name_ar: '', abbreviation: '', parent_unit_id: '', conversion_factor: '' });
    setEditingId(null);
    setIsOpen(false);
  };

  const handleEdit = (unit: Unit) => {
    setEditingId(unit.id);
    setNewUnit({
      name: unit.name || '',
      name_ar: unit.name_ar || '',
      abbreviation: unit.abbreviation || '',
      parent_unit_id: unit.parent_unit_id?.toString() || '',
      conversion_factor: unit.conversion_factor?.toString() || ''
    });
    setIsOpen(true);
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

  const renderUnit = (unit: Unit, index: number, isSubUnit = false) => (
    <motion.div
      key={unit.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`glass-card p-6 hover:shadow-lg transition-all duration-300 group ${isSubUnit ? 'ms-8 border-s-4 border-primary/30' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isSubUnit ? 'bg-gradient-to-br from-primary/20 to-primary/10' : 'bg-gradient-to-br from-success/20 to-success/10'}`}>
            <Ruler className={`w-6 h-6 ${isSubUnit ? 'text-primary' : 'text-success'}`} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-lg">
              {unit.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {unit.abbreviation}
              {unit.parent_unit && (
                <span className="text-primary ms-2">
                  ({unit.conversion_factor} {unit.parent_unit.abbreviation})
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
            onClick={() => handleEdit(unit)}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
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
  );

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
          <p className="text-muted-foreground mt-1">إدارة وحدات القياس والوحدات الفرعية</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0 gap-2">
              <Plus className="w-4 h-4" />
              إضافة وحدة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'تعديل وحدة القياس' : 'إضافة وحدة قياس جديدة'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>الاسم (بالعربية)</Label>
                <Input
                  value={newUnit.name_ar}
                  onChange={(e) => setNewUnit({ ...newUnit, name_ar: e.target.value })}
                  placeholder="كيلوجرام"
                />
              </div>

              <div className="space-y-2">
                <Label>الاسم (English)</Label>
                <Input
                  value={newUnit.name}
                  onChange={(e) => setNewUnit({ ...newUnit, name: e.target.value })}
                  placeholder="Kilogram"
                />
              </div>

              <div className="space-y-2">
                <Label>الاختصار</Label>
                <Input
                  value={newUnit.abbreviation}
                  onChange={(e) => setNewUnit({ ...newUnit, abbreviation: e.target.value })}
                  placeholder="كجم"
                />
              </div>

              <div className="space-y-2">
                <Label>الوحدة الرئيسية (اختياري)</Label>
                <Select 
                  value={newUnit.parent_unit_id || 'none'} 
                  onValueChange={(value) => setNewUnit({ ...newUnit, parent_unit_id: value === 'none' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الوحدة الرئيسية" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">بدون وحدة رئيسية</SelectItem>
                    {parentUnits
                      .filter((u: Unit) => u.id !== editingId) // Prevent self-reference
                      .map((unit: Unit) => (
                        <SelectItem key={unit.id} value={unit.id.toString()}>
                          {unit.name} ({unit.abbreviation})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {newUnit.parent_unit_id && newUnit.parent_unit_id !== 'none' && (
                <div className="space-y-2">
                  <Label>معامل التحويل</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newUnit.conversion_factor}
                    onChange={(e) => setNewUnit({ ...newUnit, conversion_factor: e.target.value })}
                    placeholder="1"
                  />
                  <p className="text-xs text-muted-foreground">
                    كم وحدة فرعية تساوي وحدة رئيسية واحدة؟ (مثال: 1000 جرام = 1 كيلو)
                  </p>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={resetForm}>
                  إلغاء
                </Button>
                <Button onClick={handleSubmit} disabled={createUnit.isPending || updateUnit.isPending}>
                  {(createUnit.isPending || updateUnit.isPending) ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {editingId ? 'جاري التحديث...' : 'جاري الإضافة...'}
                    </>
                  ) : (
                    editingId ? 'تحديث' : 'إضافة'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {parentUnits.map((unit: Unit, index: number) => (
          <React.Fragment key={unit.id}>
            {renderUnit(unit, index)}
            {/* Render sub-units */}
            {unit.sub_units && unit.sub_units.length > 0 && (
              <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {unit.sub_units.map((subUnit: Unit, subIndex: number) => 
                  renderUnit(subUnit, subIndex, true)
                )}
              </div>
            )}
          </React.Fragment>
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
