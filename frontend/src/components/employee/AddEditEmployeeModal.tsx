import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useEmployees } from '@/hooks/useEmployees';
import type { Employee, CreateEmployeeData, UpdateEmployeeData } from '@/api/employeeService';

// 1. مخطط التحقق من صحة البيانات باستخدام Zod
const employeeSchema = z.object({
  user_id: z.number().optional(), // اختياري لأنه غير موجود في وضع التعديل
  job_title: z.string().min(1, 'المسمى الوظيفي مطلوب.'),
  department: z.string().optional(),
  salary_type: z.enum(['monthly', 'hourly']),
  salary: z.coerce.number().min(0).optional(),
  hourly_rate: z.coerce.number().min(0).optional(),
  hire_date: z.string().optional(),
}).refine(data => {
  if (data.salary_type === 'monthly') return data.salary !== undefined && data.salary >= 0;
  return true;
}, { message: 'الراتب الشهري مطلوب.', path: ['salary'] })
.refine(data => {
  if (data.salary_type === 'hourly') return data.hourly_rate !== undefined && data.hourly_rate >= 0;
  return true;
}, { message: 'السعر بالساعة مطلوب.', path: ['hourly_rate'] });

// استنتاج نوع البيانات من المخطط
type EmployeeFormData = z.infer<typeof employeeSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}

export const AddEditEmployeeModal: React.FC<Props> = ({ isOpen, onClose, employee }) => {
  // 2. استخدام useEmployees hook
  const { unlinkedUsers, isLoadingUnlinkedUsers, createEmployee, isCreating, updateEmployee, isUpdating } = useEmployees();
  const isEditMode = !!employee;

  // 3. إعداد react-hook-form
  const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      salary_type: 'monthly',
      salary: 0,
      hourly_rate: 0,
    }
  });

  // 4. مراقبة وتصفير الحقول (الحل الجذري للمشكلة)
  const salaryType = watch('salary_type');
  useEffect(() => {
    if (salaryType === 'monthly') {
      setValue('hourly_rate', 0);
    } else if (salaryType === 'hourly') {
      setValue('salary', 0);
    }
  }, [salaryType, setValue]);

  // 5. تعبئة الفورم عند فتح النافذة
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && employee) {
        reset({
          user_id: employee.user_id,
          job_title: employee.job_title,
          department: employee.department || '',
          salary_type: employee.salary_type,
          salary: employee.salary || 0,
          hourly_rate: employee.hourly_rate || 0,
          hire_date: employee.hire_date ? employee.hire_date.split('T')[0] : '',
        });
      } else {
        reset({
          job_title: '',
          department: '',
          salary_type: 'monthly',
          salary: 0,
          hourly_rate: 0,
          hire_date: '',
          user_id: undefined,
        });
      }
    }
  }, [employee, isEditMode, isOpen, reset]);

  // 6. دالة إرسال الفورم
  const onSubmit = (data: EmployeeFormData) => {
    if (isEditMode && employee) {
      const { user_id, ...updateData } = data; // إزالة user_id من بيانات التحديث
      updateEmployee({ id: employee.id, data: updateData as UpdateEmployeeData }, {
        onSuccess: onClose,
      });
    } else {
      createEmployee(data as CreateEmployeeData, {
        onSuccess: onClose,
      });
    }
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 py-4">
          {!isEditMode && (
            <div className="space-y-2">
              <Label>اختر المستخدم</Label>
              <Controller
                name="user_id"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={(v) => field.onChange(parseInt(v))} disabled={isLoadingUnlinkedUsers}>
                    <SelectTrigger><SelectValue placeholder="اختر حساب مستخدم..." /></SelectTrigger>
                    <SelectContent>
                      {unlinkedUsers.map(user => (
                        <SelectItem key={user.id} value={user.id.toString()}>{user.name} ({user.email})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.user_id && <p className="text-xs text-destructive">{errors.user_id.message}</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label>المسمى الوظيفي</Label>
            <Controller name="job_title" control={control} render={({ field }) => <Input {...field} />} />
            {errors.job_title && <p className="text-xs text-destructive">{errors.job_title.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label>القسم</Label>
            <Controller name="department" control={control} render={({ field }) => <Input {...field} />} />
          </div>

          <div className="space-y-2">
            <Label>نوع الراتب</Label>
            <Controller name="salary_type" control={control} render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">شهري</SelectItem>
                  <SelectItem value="hourly">بالساعة</SelectItem>
                </SelectContent>
              </Select>
            )} />
          </div>

          {salaryType === 'monthly' && (
            <div className="space-y-2">
              <Label>الراتب الشهري</Label>
              <Controller name="salary" control={control} render={({ field }) => <Input {...field} type="number" step="0.01" />} />
              {errors.salary && <p className="text-xs text-destructive">{errors.salary.message}</p>}
            </div>
          )}

          {salaryType === 'hourly' && (
            <div className="space-y-2">
              <Label>سعر الساعة</Label>
              <Controller name="hourly_rate" control={control} render={({ field }) => <Input {...field} type="number" step="0.01" />} />
              {errors.hourly_rate && <p className="text-xs text-destructive">{errors.hourly_rate.message}</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label>تاريخ التوظيف</Label>
            <Controller name="hire_date" control={control} render={({ field }) => <Input {...field} type="date" />} />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEditMode ? 'حفظ التغييرات' : 'إضافة'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
