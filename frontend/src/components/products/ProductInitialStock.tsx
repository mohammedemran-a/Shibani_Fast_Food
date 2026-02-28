import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

/**
 * مكون متخصص لإدارة حقول المخزون الأولي للمنتج.
 * 
 * المعرفة (لماذا هذا المكون؟):
 * 1.  **فصل المسؤوليات:** هذا المكون مسؤول فقط عن عرض والتحكم في حقول المخزون.
 *     لا يهتم باسم المنتج أو الباركودات أو أي شيء آخر.
 * 2.  **الاتصال بالأب (useFormContext):** بدلاً من تمرير دوال `control` و `register`
 *     وغيرها كـ props (وهو ما يسمى "prop drilling")، نستخدم `useFormContext`.
 *     هذا الـ hook يسمح لأي مكون ابن بالوصول إلى حالة الفورم الكاملة التي تم
 *     توفيرها بواسطة المكون `<Form>` من `shadcn/ui` في `ProductForm.tsx`.
 *     هذا يجعل الكود أنظف وأكثر قابلية للصيانة.
 * 3.  **أسماء الحقول المتداخلة:** لاحظ كيف نستخدم `initial_stock.quantity`.
 *     مكتبة `react-hook-form` تفهم هذه الصيغة النقطية (dot notation) للوصول
 *     إلى الحقول داخل الكائنات المتداخلة في حالة الفورم.
 */
export function ProductInitialStock() {
  // الوصول إلى سياق الفورم الذي تم إنشاؤه في المكون الأب
  const { control } = useFormContext();

  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="initial_stock.quantity" // اسم الحقل المتداخل
        render={({ field }) => (
          <FormItem>
            <FormLabel>الكمية الأولية</FormLabel>
            <FormControl>
              <Input type="number" placeholder="0" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="initial_stock.purchase_price" // اسم الحقل المتداخل
        render={({ field }) => (
          <FormItem>
            <FormLabel>سعر شراء الوحدة الأساسية</FormLabel>
            <FormControl>
              <Input type="number" placeholder="0.00" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="initial_stock.expiry_date" // اسم الحقل المتداخل
        render={({ field }) => (
          <FormItem>
            <FormLabel>تاريخ انتهاء الصلاحية (اختياري)</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
