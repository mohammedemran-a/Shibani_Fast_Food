import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PlusCircle, Trash2, X, Upload, Loader2 } from 'lucide-react';

// استيراد المكونات المرئية
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// استيراد Hooks والأنواع
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useBrands } from '@/hooks/useBrands';

// مخطط Zod للتحقق من صحة البيانات (Schema)
const productFormSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(2, { message: "اسم المنتج مطلوب." }),
    category_id: z.string({ required_error: "يجب اختيار الفئة." }),
    brand_id: z.string().optional().nullable(),
    product_type: z.enum(['Standard', 'Weighted'], { required_error: "يجب تحديد نوع المنتج." }),
    base_unit: z.object({
        name: z.string().min(1, { message: "اسم الوحدة الأساسية مطلوب." }),
        barcode: z.string().optional().nullable(),
    }),
    additional_units: z.array(z.object({
        id: z.number().optional(),
        name: z.string().min(1, { message: "اسم الوحدة مطلوب." }),
        conversion_factor: z.coerce.number().gt(0, { message: "يجب أن يكون أكبر من صفر." }),
        barcode: z.string().optional().nullable(),
        selling_price: z.coerce.number().min(0).optional().nullable(),
    })).optional(),
    initial_batch: z.object({
        quantity: z.coerce.number().min(0).optional(),
        cost_price: z.coerce.number().min(0).optional(),
        expiry_date: z.string().optional().nullable(),
    }).optional(),
    base_selling_price: z.coerce.number().min(0, { message: "سعر البيع مطلوب." }),
    sku: z.string().optional().nullable(),
    reorder_level: z.coerce.number().optional().nullable(),
    description: z.string().optional().nullable(),
    is_active: z.boolean().default(true),
    image_url: z.string().optional().nullable(),
    stock_batches: z.any().optional(),
}).refine(data => {
    if (!data.initial_batch || isNaN(data.initial_batch.quantity as number)) return true;
    if (data.initial_batch.quantity && data.initial_batch.quantity > 0) {
        return data.initial_batch.cost_price !== undefined && data.initial_batch.cost_price >= 0;
    }
    return true;
}, {
    message: "يجب إدخال سعر التكلفة للدفعة الأولية.",
    path: ["initial_batch", "cost_price"],
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  existingProduct?: ProductFormValues;
}

export default function ProductForm({ existingProduct }: ProductFormProps) {
    const navigate = useNavigate();
    const isEditMode = !!existingProduct;

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(existingProduct?.image_url || null);

    const { data: categoriesData, isLoading: isLoadingCategories } = useCategories();
    const { data: brandsData, isLoading: isLoadingBrands } = useBrands();
    
    const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
    const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
    
    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues: existingProduct || {
            name: '',
            category_id: '',
            brand_id: '',
            product_type: 'Standard',
            is_active: true,
            base_unit: { name: '', barcode: '' },
            additional_units: [],
            initial_batch: { quantity: 0, cost_price: 0, expiry_date: '' },
            base_selling_price: 0,
            sku: '',
            reorder_level: 0,
            description: '',
        },
        mode: 'onChange',
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "additional_units",
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    function onSubmit(data: ProductFormValues) {
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (value === null || value === undefined) return;
            if (key === 'initial_batch' && isEditMode) return;
            if (['image_url', 'stock_batches'].includes(key)) return;

            if (typeof value === 'boolean') {
                // ✅ الحل الجذري: تحويل القيم المنطقية إلى 1 أو 0
                formData.append(key, value ? '1' : '0');
            } else if (typeof value === 'object' && !Array.isArray(value)) {
                Object.entries(value).forEach(([subKey, subValue]) => {
                    if (subValue !== null && subValue !== undefined) {
                        formData.append(`${key}[${subKey}]`, String(subValue));
                    }
                });
            } else if (Array.isArray(value)) {
                value.forEach((item, index) => {
                    Object.entries(item).forEach(([itemKey, itemValue]) => {
                        if (itemValue !== null && itemValue !== undefined) {
                            formData.append(`${key}[${index}][${itemKey}]`, String(itemValue));
                        }
                    });
                });
            } else {
                formData.append(key, String(value));
            }
        });

        if (imageFile) {
            formData.append('image', imageFile);
        }
        
        if (isEditMode && existingProduct) {
            formData.append('_method', 'PUT');
            updateProduct({ id: existingProduct.id!, data: formData }, {
                onSuccess: () => {
                    toast.success("تم تحديث المنتج بنجاح!");
                    navigate('/products');
                },
                onError: (error: any) => {
                    toast.error(error.response?.data?.message || "فشل في تحديث المنتج.");
                },
            });
        } else {
            createProduct(formData, {
                onSuccess: () => {
                    toast.success("تم إنشاء المنتج بنجاح!");
                    navigate('/products');
                },
                onError: (error: any) => {
                    const errors = error.response?.data?.errors;
                    if (errors) {
                        const firstErrorKey = Object.keys(errors)[0];
                        const firstErrorMessage = errors[firstErrorKey][0];
                        toast.error(firstErrorMessage);
                    } else {
                        toast.error(error.response?.data?.message || "فشل في إنشاء المنتج.");
                    }
                },
            });
        }
    }

    const isProcessing = isCreating || isUpdating;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    <div className="lg:col-span-2 space-y-8">
                        <Card>
                            <CardHeader><CardTitle>1. الهوية الأساسية للمنتج</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField name="name" control={form.control} render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>اسم المنتج</FormLabel>
                                        <FormControl><Input placeholder="مثال: عصير تفاح الربيع" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField name="category_id" control={form.control} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>الفئة</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingCategories}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="اختر فئة..." /></SelectTrigger></FormControl>
                                            <SelectContent>{categoriesData?.data?.map((cat: any) => <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField name="brand_id" control={form.control} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>العلامة التجارية (اختياري)</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || ''} disabled={isLoadingBrands}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="اختر علامة تجارية..." /></SelectTrigger></FormControl>
                                            <SelectContent>{brandsData?.data?.map((brand: any) => <SelectItem key={brand.id} value={String(brand.id)}>{brand.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField name="product_type" control={form.control} render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>نوع المنتج</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="Standard">منتج بالعدد (Standard)</SelectItem>
                                                <SelectItem value="Weighted">منتج بالوزن (Weighted)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>اختر "بالوزن" لمنتجات مثل البهارات والخضروات.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>2. الوحدات والباركودات</CardTitle></CardHeader>
                            <CardContent className="space-y-6">
                                <div className="p-4 border rounded-lg bg-background">
                                    <h3 className="font-semibold mb-2">الوحدة الأساسية (أصغر وحدة بيع)</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField name="base_unit.name" control={form.control} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>اسم الوحدة</FormLabel>
                                                <FormControl><Input placeholder="علبة، حبة، جرام" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>
                                        <FormField name="base_unit.barcode" control={form.control} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>باركود الوحدة / البحث</FormLabel>
                                                <FormControl><Input placeholder="امسح الباركود أو أدخل رمزًا" {...field} value={field.value || ''} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="font-semibold mb-2">الوحدات الإضافية (اختياري)</h3>
                                    <div className="space-y-4">
                                        {fields.map((field, index) => (
                                            <div key={field.id} className="flex items-end gap-2 p-3 border rounded-md">
                                                <FormField name={`additional_units.${index}.name`} control={form.control} render={({ field }) => (
                                                    <FormItem className="flex-1"><FormLabel>اسم الوحدة</FormLabel><FormControl><Input placeholder="كرتونة" {...field} /></FormControl><FormMessage /></FormItem>
                                                )}/>
                                                <FormField name={`additional_units.${index}.conversion_factor`} control={form.control} render={({ field }) => (
                                                    <FormItem className="w-28"><FormLabel>تحتوي على</FormLabel><FormControl><Input type="number" placeholder="24" {...field} /></FormControl><FormMessage /></FormItem>
                                                )}/>
                                                <FormField name={`additional_units.${index}.barcode`} control={form.control} render={({ field }) => (
                                                    <FormItem className="flex-1"><FormLabel>باركود</FormLabel><FormControl><Input placeholder="امسح الباركود" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                                                )}/>
                                                <FormField name={`additional_units.${index}.selling_price`} control={form.control} render={({ field }) => (
                                                    <FormItem className="w-32"><FormLabel>سعر خاص</FormLabel><FormControl><Input type="number" placeholder="55" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                                                )}/>
                                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                                            </div>
                                        ))}
                                        <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', conversion_factor: 1, barcode: '', selling_price: undefined })}>
                                            <PlusCircle className="mr-2 h-4 w-4" /> إضافة وحدة إضافية
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-8">
                        {isEditMode && existingProduct ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>ملخص المخزون الحالي</CardTitle>
                                    <CardDescription>لا يمكن تعديل المخزون من هنا. استخدم فواتير الشراء أو المرتجعات.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>الكمية</TableHead>
                                                <TableHead>التكلفة</TableHead>
                                                <TableHead>الصلاحية</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {existingProduct.stock_batches && existingProduct.stock_batches.length > 0 ? (
                                                existingProduct.stock_batches.map((batch: any) => (
                                                    <TableRow key={batch.id}>
                                                        <TableCell>{batch.quantity_remaining}</TableCell>
                                                        <TableCell>{batch.purchase_price_per_unit}</TableCell>
                                                        <TableCell>{batch.expiry_date || 'لا يوجد'}</TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow><TableCell colSpan={3} className="text-center">لا يوجد مخزون حالي</TableCell></TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle>3. الدفعة الأولية</CardTitle>
                                    <CardDescription>للمخزون الموجود حاليًا فقط. اتركه فارغًا للمنتجات الجديدة تمامًا.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField name="initial_batch.quantity" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>الكمية الحالية (بالوحدة الأساسية)</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField name="initial_batch.cost_price" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>تكلفة الوحدة الأساسية</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField name="initial_batch.expiry_date" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>تاريخ الصلاحية (اختياري)</FormLabel><FormControl><Input type="date" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader><CardTitle>{isEditMode ? '3. ' : '4. '}التسعير والتنظيم</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <FormField name="base_selling_price" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>سعر بيع الوحدة الأساسية</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField name="sku" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>رمز SKU (اختياري)</FormLabel><FormControl><Input placeholder="سيتم توليده تلقائيًا" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                
                                <FormItem>
                                    <FormLabel>صورة المنتج</FormLabel>
                                    <div className="flex items-center gap-4">
                                        {imagePreview ? (
                                            <div className="relative">
                                                <img src={imagePreview} alt="Preview" className="w-24 h-24 rounded-lg object-cover border" />
                                                <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => { setImageFile(null); setImagePreview(null); }}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary">
                                                <Upload className="w-8 h-8 text-muted-foreground" />
                                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                            </label>
                                        )}
                                    </div>
                                </FormItem>

                                <FormField name="is_active" control={form.control} render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5"><FormLabel>المنتج نشط</FormLabel></div>
                                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    </FormItem>
                                )}/>
                            </CardContent>
                        </Card>
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
