import { useFormContext, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Plus, Trash2 } from 'lucide-react';

/**
 * مكون متخصص لإدارة مصفوفة الباركودات والوحدات الديناميكية.
 * 
 * المعرفة (لماذا هذا المكون وكيف يعمل؟):
 * 1.  **`useFieldArray` هو الحل الجذري:** هذا الـ hook من `react-hook-form`
 *     هو الأداة المثالية لإدارة الحقول التي هي عبارة عن مصفوفات.
 *     - `fields`: هي مصفوفة "مُحسَّنة" من `react-hook-form` تمثل عناصر الباركود.
 *       كل عنصر فيها يحتوي على `id` فريد ومستقر، مما يساعد React على عرض
 *       القائمة بكفاءة دون إعادة رسم غير ضرورية عند الحذف أو الإضافة.
 *     - `append`: دالة لإضافة عنصر جديد إلى نهاية المصفوفة.
 *     - `remove`: دالة لحذف عنصر من المصفوفة باستخدام `index` الخاص به.
 * 
 * 2.  **فصل المسؤوليات:** هذا المكون معزول تمامًا. كل ما يعرفه هو كيفية
 *     إدارة حقل يسمى `barcodes` في الفورم. لا يهتم بأي حقول أخرى.
 * 
 * 3.  **أسماء الحقول الديناميكية:** لاحظ كيف نستخدم `barcodes.${index}.barcode`.
 *     `react-hook-form` يفهم هذه الصيغة لربط كل حقل إدخال بالعنصر الصحيح
 *     في مصفوفة الحالة، مما يضمن أن التحقق من الصحة وتتبع القيم يعمل بشكل صحيح
 *     لكل سطر على حدة.
 */
export function ProductBarcodesManager() {
  // الوصول إلى سياق الفورم من المكون الأب
  const { control } = useFormContext();

  // إعداد useFieldArray للتحكم في حقل 'barcodes'
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'barcodes',
  });

  // دالة لإضافة باركود جديد بقيم افتراضية
  const addBarcodeRow = () => {
    append({
      barcode: '',
      unit_name: '',
      unit_quantity: 1,
      selling_price: undefined,
    });
  };

  return (
    <div className="space-y-4">
      {/* عرض كل حقول الباركود الموجودة في المصفوفة */}
      {fields.map((field, index) => (
        <div key={field.id} className="grid grid-cols-12 gap-x-4 gap-y-2 items-start p-4 border rounded-lg relative">
          {/* حقل اسم الوحدة */}
          <FormField
            control={control}
            name={`barcodes.${index}.unit_name`}
            render={({ field }) => (
              <FormItem className="col-span-6 md:col-span-3">
                <FormLabel>اسم الوحدة</FormLabel>
                <FormControl>
                  <Input placeholder="كرتونة، صندوق..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* حقل الباركود */}
          <FormField
            control={control}
            name={`barcodes.${index}.barcode`}
            render={({ field }) => (
              <FormItem className="col-span-6 md:col-span-4">
                <FormLabel>الباركود</FormLabel>
                <FormControl>
                  <Input placeholder="امسح أو أدخل الباركود" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* حقل كمية الوحدة */}
          <FormField
            control={control}
            name={`barcodes.${index}.unit_quantity`}
            render={({ field }) => (
              <FormItem className="col-span-6 md:col-span-2">
                <FormLabel>تحتوي على</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="12" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* حقل سعر بيع الوحدة */}
          <FormField
            control={control}
            name={`barcodes.${index}.selling_price`}
            render={({ field }) => (
              <FormItem className="col-span-6 md:col-span-2">
                <FormLabel>سعر البيع (اختياري)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="سعر الوحدة الأساسية" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* زر الحذف */}
          <div className="col-span-12 md:col-span-1 flex items-end justify-end h-full">
            {/* لا نسمح بحذف آخر عنصر لضمان وجود باركود واحد على الأقل */}
            {fields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => remove(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      ))}

      {/* زر لإضافة صف جديد */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-4 gap-2"
        onClick={addBarcodeRow}
      >
        <Plus className="w-4 h-4" />
        إضافة وحدة / باركود آخر
      </Button>
    </div>
  );
}
