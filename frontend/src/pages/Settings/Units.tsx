import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Ruler, Loader2 } from 'lucide-react';
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
  name_ar?: string;
  abbreviation: string;
  parent_unit_id?: number | null;
  conversion_factor?: number | null;
  parent_unit?: Unit | null;
  sub_units?: Unit[];
}

const Units: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [formData, setFormData] = React.useState({ 
    name: '', 
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
    if (!formData.name || !formData.abbreviation) {
      toast.error(t('common.requiredFields'));
      return;
    }

    const data: any = {
      name: formData.name,
      abbreviation: formData.abbreviation,
    };

    // Add parent unit if selected
    if (formData.parent_unit_id && formData.parent_unit_id !== 'none') {
      data.parent_unit_id = parseInt(formData.parent_unit_id);
      data.conversion_factor = formData.conversion_factor ? parseFloat(formData.conversion_factor) : 1;
    } else {
      data.parent_unit_id = null;
      data.conversion_factor = null;
    }

    try {
      if (editingId) {
        await updateUnit.mutateAsync({ id: editingId, data });
        toast.success(t('common.success'));
      } else {
        await createUnit.mutateAsync(data);
        toast.success(t('common.success'));
      }
      resetForm();
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

  const resetForm = () => {
    setFormData({ name: '', abbreviation: '', parent_unit_id: '', conversion_factor: '' });
    setEditingId(null);
    setIsOpen(false);
  };

  const handleEdit = (unit: Unit) => {
    setEditingId(unit.id);
    setFormData({
      name: unit.name || '',
      abbreviation: unit.abbreviation || '',
      parent_unit_id: unit.parent_unit_id?.toString() || '',
      conversion_factor: unit.conversion_factor?.toString() || ''
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('common.deleteUserWarning'))) {
      return;
    }

    try {
      await deleteUnit.mutateAsync(id);
      toast.success(t('common.success'));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('common.error'));
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
              {i18n.language === 'ar' ? (unit.name_ar || unit.name) : (unit.name || unit.name_ar)}
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
          <p className="text-muted-foreground mt-1">{t('nav.units')}</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0 gap-2">
              <Plus className="w-4 h-4" />
              {t('common.add')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? t('common.edit') : t('common.add')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>{t('common.name')} *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('common.name')}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('products.unit')} (Abbr) *</Label>
                <Input
                  value={formData.abbreviation}
                  onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })}
                  placeholder="kg, pc, etc."
                />
              </div>

              <div className="space-y-2">
                <Label>{t('products.unit')} (Parent)</Label>
                <Select 
                  value={formData.parent_unit_id || 'none'} 
                  onValueChange={(value) => setFormData({ ...formData, parent_unit_id: value === 'none' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('products.selectUnit')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('common.notSpecified')}</SelectItem>
                    {parentUnits
                      .filter((u: Unit) => u.id !== editingId)
                      .map((unit: Unit) => (
                        <SelectItem key={unit.id} value={unit.id.toString()}>
                          {unit.name} ({unit.abbreviation})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.parent_unit_id && formData.parent_unit_id !== 'none' && (
                <div className="space-y-2">
                  <Label>Conversion Factor</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.conversion_factor}
                    onChange={(e) => setFormData({ ...formData, conversion_factor: e.target.value })}
                    placeholder="1"
                  />
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={resetForm}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleSubmit} disabled={createUnit.isPending || updateUnit.isPending}>
                  {(createUnit.isPending || updateUnit.isPending) ? (
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
        {parentUnits.map((unit: Unit, index: number) => (
          <React.Fragment key={unit.id}>
            {renderUnit(unit, index)}
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
          <p className="text-muted-foreground">{t('common.noData')}</p>
        </div>
      )}
    </div>
  );
};

export default Units;
