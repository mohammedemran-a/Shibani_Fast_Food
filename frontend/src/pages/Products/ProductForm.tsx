import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, Utensils, Box, Trash2, Upload } from 'lucide-react';

// استيراد المكونات المرئية
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ProductSearchCombobox } from '@/components/products/ProductSearchCombobox';

// استيراد Hooks والأنواع
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProductMutations';
import { useCategories } from '@/hooks/useCategories';
import { Product } from '@/types';

// ✅✅✅ هذا هو التعديل الجذري الأول ✅✅✅
const MAX_FILE_SIZE = 10 * 2024 * 2024; // 10 ميجابايت
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

// مخطط Zod النهائي مع التحقق من حجم الصورة
const productFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, { message: "اسم المنتج مطلوب." }),
  type: z.enum(['Sellable', 'RawMaterial']),
  category_id: z.coerce.number().min(1, { message: "يجب اختيار الفئة." }),
  is_active: z.boolean().default(true),
  image: z.any()
    .optional()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, `الحد الأقصى لحجم الصورة هو 10 ميجابايت.`)
    .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), "نوع الصورة غير مدعوم."),
  price: z.coerce.number().optional(),
  unit: z.string().optional(),
  ingredients: z.array(z.object({
    id: z.number(),
    name: z.string(),
    quantity: z.coerce.number().gt(0, { message: "الكمية يجب أن تكون أكبر من صفر." }),
  })).optional(),
}).refine(data => (data.type === 'Sellable' ? data.price !== undefined && data.price >= 0 : true), { message: "سعر البيع مطلوب للوجبات.", path: ["price"] })
  .refine(data => (data.type === 'RawMaterial' ? data.unit !== undefined && data.unit.length > 0 : true), { message: "وحدة القياس مطلوبة للمواد الخام.", path: ["unit"] });

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  existingProduct?: Product;
}

export default function ProductForm({ existingProduct }: ProductFormProps) {
    // ... باقي الكود يبقى كما هو بدون تغيير ...
    const navigate = useNavigate();
    const isEditMode = !!existingProduct;

    const { data: categoriesResponse, isLoading: isLoadingCategories } = useCategories();
    const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
    const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
    
    const categories = categoriesResponse?.data ?? [];
    const [imagePreview, setImagePreview] = useState<string | null>(existingProduct?.image_url || null);

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues: isEditMode ? {
            ...existingProduct,
            category_id: existingProduct.category?.id,
            price: Number(existingProduct.price),
            ingredients: existingProduct.ingredients?.map(ing => ({
                id: ing.id,
                name: ing.name,
                quantity: ing.pivot.quantity,
            }))
        } : {
            name: '',
            type: 'Sellable',
            is_active: true,
            price: 0,
            unit: '',
            ingredients: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "ingredients",
    });

    const productType = form.watch('type');

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            form.setValue('image', file, { shouldValidate: true }); // تفعيل التحقق عند التغيير
            setImagePreview(URL.createObjectURL(file));
        }
    };

    function onSubmit(data: ProductFormValues) {
        const formData = new FormData();
        const payload = { ...data };

        if (payload.type === 'Sellable') {
            delete (payload as any).unit;
        } else if (payload.type === 'RawMaterial') {
            delete (payload as any).price;
            delete (payload as any).ingredients;
        }

        Object.entries(payload).forEach(([key, value]) => {
            if (key === 'ingredients' && Array.isArray(value)) {
                value.forEach((item, index) => {
                    formData.append(`ingredients[${index}][id]`, String(item.id));
                    formData.append(`ingredients[${index}][quantity]`, String(item.quantity));
                });
            } else if (key === 'image' && value instanceof File) {
                formData.append('image', value);
            } else if (value !== null && value !== undefined) {
                formData.append(key, String(value === true ? 1 : value === false ? 0 : value));
            }
        });

        const handleSuccess = (action: string) => {
            toast.success(`تم ${action} المنتج بنجاح!`);
            navigate('/products');
        };

        const handleError = (action: string, error: any) => {
            console.error(`AXIOS ERROR ON ${action.toUpperCase()}:`, error.response);
            let errorMessage = `فشل ${action} المنتج.`;
            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                const firstErrorKey = Object.keys(errors)[0];
                errorMessage = errors[firstErrorKey][0];
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            toast.error(errorMessage);
        };

        if (isEditMode) {
            if (!existingProduct?.id) {
                toast.error("خطأ: رقم المنتج غير موجود. لا يمكن التحديث.");
                return;
            }
            
            formData.append('_method', 'PUT');
            
            updateProduct(
                { id: existingProduct.id, productData: formData },
                {
                    onSuccess: () => handleSuccess('تحديث'),
                    onError: (error) => handleError('تحديث', error),
                }
            );
        } else {
            createProduct(formData, {
                onSuccess: () => handleSuccess('إنشاء'),
                onError: (error) => handleError('إنشاء', error),
            });
        }
    }

    const isProcessing = isCreating || isUpdating;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* ... باقي الكود (JSX) يبقى كما هو بدون تغيير ... */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <Card>
                            <CardHeader><CardTitle>معلومات المنتج الأساسية</CardTitle></CardHeader>
                            <CardContent className="space-y-6">
                                <FormField name="type" control={form.control} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>نوع المنتج</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isEditMode}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="Sellable"><div className="flex items-center gap-2"><Utensils size={16} /> وجبة</div></SelectItem>
                                                <SelectItem value="RawMaterial"><div className="flex items-center gap-2"><Box size={16} /> مادة خام</div></SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField name="name" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>اسم المنتج</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField name="category_id" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>الفئة</FormLabel>
                                        <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value || '')} disabled={isLoadingCategories}>
                                            <FormControl><SelectTrigger><SelectValue placeholder={isLoadingCategories ? "جاري تحميل..." : "اختر فئة"} /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {categories.map((cat) => <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select><FormMessage />
                                    </FormItem>
                                )}/>
                            </CardContent>
                        </Card>

                        {productType === 'Sellable' && (
                            <Card>
                                <CardHeader><CardTitle>تفاصيل الوجبة</CardTitle></CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField name="price" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>سعر البيع</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <Separator />
                                    <div>
                                        <h3 className="text-lg font-medium mb-4">الوصفة (المكونات)</h3>
                                        <div className="space-y-4">
                                            {fields.map((field, index) => (
                                                <div key={field.id} className="flex items-end gap-2 p-3 border rounded-md bg-muted/50">
                                                    <div className="flex-1 font-medium">{field.name}</div>
                                                    <FormField name={`ingredients.${index}.quantity`} control={form.control} render={({ field: quantityField }) => (
                                                        <FormItem className="w-32"><FormLabel>الكمية</FormLabel><FormControl><Input type="number" step="0.001" {...quantityField} /></FormControl><FormMessage /></FormItem>
                                                    )}/>
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                                                </div>
                                            ))}
                                            <ProductSearchCombobox 
                                                onSelect={(product) => append({ id: product.id, name: product.name, quantity: 1 })}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {productType === 'RawMaterial' && (
                            <Card>
                                <CardHeader><CardTitle>تفاصيل المادة الخام</CardTitle></CardHeader>
                                <CardContent>
                                    <FormField name="unit" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>وحدة القياس الأساسية</FormLabel>
                                            <FormControl><Input placeholder="مثال: كجم، حبة، لتر" {...field} /></FormControl>
                                            <FormDescription>هذه هي الوحدة التي سيتم تتبع المخزون بها.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-8">
                        <Card>
                            <CardHeader><CardTitle>صورة المنتج</CardTitle></CardHeader>
                            <CardContent className="flex flex-col items-center justify-center space-y-4">
                                <div className="w-full h-48 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="معاينة المنتج" className="h-full w-full object-contain rounded-md" />
                                    ) : (
                                        <div className="text-center text-muted-foreground">
                                            <Upload className="mx-auto h-12 w-12" />
                                            <p>اسحب وأفلت الصورة هنا، أو انقر للاختيار</p>
                                        </div>
                                    )}
                                </div>
                                <FormField name="image" control={form.control} render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormControl>
                                            <Input type="file" accept="image/*" onChange={handleImageChange} className="w-full" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </CardContent>
                        </Card>

                        <FormField name="is_active" control={form.control} render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5"><FormLabel>المنتج نشط</FormLabel><FormDescription>سيظهر المنتج في القوائم عند تفعيله.</FormDescription></div>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                        )}/>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isProcessing}>
                        {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> جاري الحفظ...</> : (isEditMode ? 'حفظ التعديلات' : 'إنشاء المنتج')}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
