import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PlusCircle, Trash2, Loader2, Utensils, Box } from 'lucide-react';

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
import { searchProducts } from '@/api';
import { Product } from '@/types';

// مخطط Zod الجديد والمبسط
const productFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, { message: "اسم المنتج مطلوب." }),
  type: z.enum(['Sellable', 'RawMaterial'], { required_error: "يجب تحديد نوع المنتج." }),
  category_id: z.string({ required_error: "يجب اختيار الفئة." }),
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
    
    // ✅✅✅ الإصلاح الجذري هنا: استخراج مصفوفة الفئات من الاستجابة ✅✅✅
    const categories = categoriesResponse?.data ?? [];

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues: isEditMode ? {
            ...existingProduct,
            category_id: String(existingProduct.category?.id || ''),
            ingredients: existingProduct.ingredients?.map(ing => ({
                id: ing.id,
                name: ing.name,
                quantity: ing.pivot.quantity,
            }))
        } : {
            name: '',
            type: 'Sellable',
            category_id: '',
            is_active: true,
            price: 0,
            cost: 0,
            stock: 0,
            unit: '',
            ingredients: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "ingredients",
    });

    const productType = form.watch('type');

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);

    useEffect(() => {
        if (searchQuery.length > 1) {
            // نفترض أن دالة البحث تبحث فقط عن المواد الخام
            searchProducts(searchQuery).then(setSearchResults);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    function onSubmit(data: ProductFormValues) {
        const payload = { ...data, category_id: Number(data.category_id) };
        const mutation = isEditMode ? updateProduct : createProduct;
        const params = isEditMode ? { id: existingProduct!.id, productData: payload } : payload;

        toast.promise(
            new Promise((resolve, reject) => { (mutation as any)(params, { onSuccess: resolve, onError: reject }); }),
            {
                loading: 'جاري الحفظ...',
                success: () => { navigate('/products'); return `تم ${isEditMode ? 'تحديث' : 'إنشاء'} المنتج بنجاح!`; },
                error: 'فشل في حفظ المنتج.',
            }
        );
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
                                <Select onValueChange={field.onChange} value={field.value} disabled={isEditMode}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="Sellable"><div className="flex items-center gap-2"><Utensils size={16} /> وجبة (منتج قابل للبيع)</div></SelectItem>
                                        <SelectItem value="RawMaterial"><div className="flex items-center gap-2"><Box size={16} /> مادة خام (مكون)</div></SelectItem>
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
                                <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingCategories}>
                                    <FormControl><SelectTrigger><SelectValue placeholder={isLoadingCategories ? "جاري تحميل الفئات..." : "اختر فئة..."} /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {/* استخدام المتغير الصحيح `categories` هنا */}
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
                                <h3 className="text-lg font-medium mb-2">الوصفة (المكونات)</h3>
                                <div className="space-y-4">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="flex items-end gap-2 p-3 border rounded-md">
                                            <div className="flex-1 font-medium">{field.name}</div>
                                            <FormField name={`ingredients.${index}.quantity`} control={form.control} render={({ field }) => (
                                                <FormItem className="w-32"><FormLabel>الكمية</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl><FormMessage /></FormItem>
                                            )}/>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                                        </div>
                                    ))}
                                    <div className="relative">
                                        <Input placeholder="ابحث عن مادة خام لإضافتها..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                        {searchResults.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
                                                {searchResults.map(item => (
                                                    <div key={item.id} className="p-2 hover:bg-muted cursor-pointer" onClick={() => { append({ id: item.id, name: item.name, quantity: 1 }); setSearchQuery(''); }}>{item.name}</div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
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
