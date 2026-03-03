import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, Utensils, Box, Trash2, ImageUp, X } from 'lucide-react';

// استيراد المكونات المرئية
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

// استيراد Hooks والأنواع
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProductMutations';
import { useCategories } from '@/hooks/useCategories';
import { Product } from '@/types';
// ✅ استيراد المكون الجديد
import { ProductSearchCombobox } from '@/components/products/ProductSearchCombobox';

// مخطط Zod النهائي (بدون تغيير)
const productFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, { message: "اسم المنتج مطلوب." }),
  type: z.enum(['Sellable', 'RawMaterial']),
  category_id: z.coerce.number().min(1, { message: "يجب اختيار الفئة." }),
  price: z.coerce.number().optional(),
  ingredients: z.array(z.object({
    id: z.number(),
    name: z.string(),
    quantity: z.coerce.number().gt(0, { message: "الكمية يجب أن تكون أكبر من صفر." }),
  })).optional(),
  cost: z.coerce.number().optional(),
  stock: z.coerce.number().optional(),
  unit: z.string().optional(),
  is_active: z.boolean().default(true),
  image: z.any().optional().nullable(),
}).refine(data => (data.type === 'Sellable' ? data.price !== undefined && data.price >= 0 : true), { message: "سعر البيع مطلوب للوجبات.", path: ["price"] })
  .refine(data => (data.type === 'RawMaterial' ? data.cost !== undefined && data.cost >= 0 : true), { message: "سعر التكلفة مطلوب للمواد الخام.", path: ["cost"] });

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  existingProduct?: Product;
}

export default function ProductForm({ existingProduct }: ProductFormProps) {
    const navigate = useNavigate();
    const isEditMode = !!existingProduct;

    const { data: categoriesResponse, isLoading: isLoadingCategories } = useCategories();
    const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
    const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
    
    const categories = categoriesResponse?.data ?? [];

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues: isEditMode ? {
            ...existingProduct,
            category_id: existingProduct.category?.id,
            image: existingProduct.image_url,
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
            cost: 0,
            stock: 0,
            unit: '',
            ingredients: [],
            image: null,
        },
    });

    const [imagePreview, setImagePreview] = useState<string | null>(existingProduct?.image_url || null);

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "ingredients",
    });

    const productType = form.watch('type');

    function onSubmit(data: ProductFormValues) {
        const formData = new FormData();
        const payload: any = { ...data };

        if (data.type === 'Sellable') {
            delete payload.cost;
            delete payload.stock;
            delete payload.unit;
            if (!data.ingredients || data.ingredients.length === 0) {
                delete payload.ingredients;
            }
        } else if (data.type === 'RawMaterial') {
            delete payload.price;
            delete payload.ingredients;
        }

        for (const key in payload) {
            const value = payload[key];
            if (value === null || value === undefined) continue;

            if (key === 'ingredients' && Array.isArray(value)) {
                value.forEach((item, index) => {
                    formData.append(`ingredients[${index}][id]`, String(item.id));
                    formData.append(`ingredients[${index}][quantity]`, String(item.quantity));
                });
            } else if (key === 'image' && value instanceof File) {
                formData.append('image', value);
            } else if (key !== 'image') {
                if (key === 'is_active') {
                    formData.append(key, value ? '1' : '0');
                } else {
                    formData.append(key, String(value));
                }
            }
        }

        if (isEditMode) {
            formData.append('_method', 'PUT');
        }

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
            updateProduct(
                { id: existingProduct!.id, productData: formData },
                { onSuccess: () => handleSuccess('تحديث'), onError: (error) => handleError('تحديث', error) }
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
                <Card>
                    <CardHeader><CardTitle>{isEditMode ? 'تعديل منتج' : 'إنشاء منتج جديد'}</CardTitle></CardHeader>
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
                                <Select onValueChange={field.onChange} defaultValue={String(field.value || '')} disabled={isLoadingCategories}>
                                    <FormControl><SelectTrigger><SelectValue placeholder={isLoadingCategories ? "جاري تحميل..." : "اختر فئة"} /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {categories.map((cat) => <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>)}
                                    </SelectContent>
                                </Select><FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="image" render={({ field: { onChange, value, ...rest } }) => (
                            <FormItem>
                                <FormLabel>صورة المنتج</FormLabel>
                                <FormControl>
                                    <div className="w-full">
                                        <label htmlFor="image-upload" className="cursor-pointer">
                                            <div className="w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
                                                {imagePreview ? (
                                                    <div className="relative w-full h-full">
                                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-lg p-2" />
                                                        <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={(e) => { e.preventDefault(); setImagePreview(null); onChange(null); }}>
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <ImageUp className="w-10 h-10 mb-2" />
                                                        <span>انقر لرفع صورة</span>
                                                    </>
                                                )}
                                            </div>
                                        </label>
                                        <Input id="image-upload" type="file" className="hidden" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" {...rest} onChange={(event) => { const file = event.target.files?.[0]; if (file) { onChange(file); setImagePreview(URL.createObjectURL(file)); } }} />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
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
                                <h3 className="text-lg font-medium mb-2">الوصفة (المكونات)</h3>
                                <div className="space-y-4">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="flex items-end gap-2 p-3 border rounded-md bg-muted/50">
                                            <div className="flex-1 font-medium">{field.name}</div>
                                            <FormField name={`ingredients.${index}.quantity`} control={form.control} render={({ field: quantityField }) => (
                                                <FormItem className="w-32">
                                                    <FormLabel>الكمية</FormLabel>
                                                    <FormControl><Input type="number" step="0.001" {...quantityField} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}/>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    
                                    <ProductSearchCombobox
                                        productType="RawMaterial"
                                        placeholder="ابحث لإضافة مادة خام..."
                                        onSelect={(product) => {
                                            if (!fields.some(field => field.id === product.id)) {
                                                append({ id: product.id, name: product.name, quantity: 1 });
                                            } else {
                                                toast.warning("هذا المكون موجود بالفعل في الوصفة.");
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {productType === 'RawMaterial' && (
                    <Card>
                        <CardHeader><CardTitle>تفاصيل المادة الخام</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField name="cost" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>تكلفة الوحدة</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField name="stock" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>المخزون الحالي</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField name="unit" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>وحدة القياس</FormLabel><FormControl><Input placeholder="kg, g, piece, L" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </CardContent>
                    </Card>
                )}
                <FormField name="is_active" control={form.control} render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5"><FormLabel>المنتج نشط</FormLabel><FormDescription>سيظهر المنتج في القوائم عند تفعيله.</FormDescription></div>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                )}/>
                <div className="flex justify-end">
                    <Button type="submit" disabled={isProcessing}>
                        {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> جاري الحفظ...</> : (isEditMode ? 'حفظ التعديلات' : 'إنشاء المنتج')}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
