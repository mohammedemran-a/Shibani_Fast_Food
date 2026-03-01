import React from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Trash2, Save, Loader2, ArrowLeft, ArrowRight, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// استيراد المكونات المرئية
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useTheme } from '@/contexts/ThemeContext';

// استيراد الخدمات والأنواع
import { ProductSearchCombobox } from '@/components/products/ProductSearchCombobox';
import { supplierService, Supplier } from '@/api/supplierService';
import { purchaseService } from '@/api/purchaseService';
import { Product, ProductBarcode } from '@/api/productService';

// مخطط Zod للتحقق من صحة البيانات (مُحَدَّث)
const purchaseItemSchema = z.object({
    product: z.custom<Product>().refine(val => val?.id, { message: "يجب اختيار المنتج." }),
    barcode_id: z.string({ required_error: "يجب اختيار الوحدة." }),
    quantity: z.coerce.number().min(0.01, "الكمية يجب أن تكون أكبر من صفر."),
    unit_purchase_price: z.coerce.number().min(0, "سعر الشراء يجب أن يكون 0 على الأقل."),
    expiry_date: z.date().optional(),
});

const purchaseFormSchema = z.object({
    supplier_id: z.string({ required_error: "يجب اختيار المورد." }),
    invoice_date: z.date(),
    items: z.array(purchaseItemSchema).min(1, "يجب إضافة منتج واحد على الأقل."),
});

type PurchaseFormValues = z.infer<typeof purchaseFormSchema>;

// مكون صف المنتج المفصول
function PurchaseItemRow({ index, control, remove, form }: { index: number, control: any, remove: (index: number) => void, form: any }) {
    const item = useWatch({ control, name: `items.${index}` });
    const selectedProduct: Product | null = item.product;
    const availableUnits: ProductBarcode[] = selectedProduct?.barcodes || [];

    const handleUnitChange = (barcodeId: string) => {
        const selectedUnit = availableUnits.find(u => u.id.toString() === barcodeId);
        if (selectedUnit) {
            form.setValue(`items.${index}.unit_purchase_price`, selectedUnit.purchase_price || 0);
        }
    };

    return (
        <div className="grid grid-cols-12 gap-4 items-start p-4 border rounded-lg relative">
            <FormField
                control={control}
                name={`items.${index}.product`}
                render={({ field }) => (
                    <FormItem className="col-span-12 md:col-span-3">
                        <FormLabel>المنتج *</FormLabel>
                        <FormControl>
                            <ProductSearchCombobox
                                selectedValue={field.value}
                                onChange={(product) => {
                                    field.onChange(product);
                                    form.setValue(`items.${index}.barcode_id`, '');
                                    form.setValue(`items.${index}.unit_purchase_price`, 0);
                                }}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name={`items.${index}.barcode_id`}
                render={({ field }) => (
                    <FormItem className="col-span-6 md:col-span-2">
                        <FormLabel>الوحدة *</FormLabel>
                        <Select
                            onValueChange={(value) => {
                                field.onChange(value);
                                handleUnitChange(value);
                            }}
                            value={field.value}
                            disabled={!selectedProduct}
                        >
                            <FormControl><SelectTrigger><SelectValue placeholder="اختر وحدة" /></SelectTrigger></FormControl>
                            <SelectContent>
                                {availableUnits.map((unit) => (
                                    <SelectItem key={unit.id} value={String(unit.id)}>{unit.unit_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name={`items.${index}.quantity`}
                render={({ field }) => (
                    <FormItem className="col-span-6 md:col-span-2">
                        <FormLabel>الكمية *</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name={`items.${index}.unit_purchase_price`}
                render={({ field }) => (
                    <FormItem className="col-span-6 md:col-span-2">
                        <FormLabel>سعر شراء الوحدة *</FormLabel>
                        <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name={`items.${index}.expiry_date`}
                render={({ field }) => (
                    <FormItem className="col-span-6 md:col-span-2">
                        <FormLabel>تاريخ الصلاحية</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                        variant={"outline"}
                                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                    >
                                        {field.value ? format(field.value, "PPP") : <span>اختر تاريخ</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <div className="col-span-12 md:col-span-1 flex items-center justify-end pt-8">
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
            </div>
        </div>
    );
}

export default function AddPurchase() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { isRTL } = useTheme();
    const BackIcon = isRTL ? ArrowRight : ArrowLeft;

    // ✅ ===================================================================
    // ✅  الحل: التأكد من أننا نأخذ المصفوفة الصحيحة من الاستجابة
    // ✅ ===================================================================
    const { data: suppliers, isLoading: isLoadingSuppliers } = useQuery({
        queryKey: ['suppliers'],
        queryFn: async () => {
            const response = await supplierService.getSuppliers({ all: true });
            // نضمن دائمًا إرجاع مصفوفة
            return response.data?.data || []; 
        },
    });

    const form = useForm<PurchaseFormValues>({
        resolver: zodResolver(purchaseFormSchema),
        defaultValues: {
            supplier_id: '',
            invoice_date: new Date(),
            items: [{ product: null, barcode_id: '', quantity: 1, unit_purchase_price: 0 }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    const createPurchaseMutation = useMutation({
        mutationFn: (data: any) => purchaseService.createPurchase(data),
        onSuccess: () => {
            toast.success("تم إنشاء فاتورة الشراء بنجاح.");
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['purchases'] });
            navigate('/purchases');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "فشل في إنشاء فاتورة الشراء.");
        },
    });

    function onSubmit(data: PurchaseFormValues) {
        const payload = {
            supplier_id: data.supplier_id,
            invoice_date: format(data.invoice_date, 'yyyy-MM-dd'),
            items: data.items.map(item => {
                const selectedUnit = item.product.barcodes?.find(u => u.id.toString() === item.barcode_id);
                if (!selectedUnit) {
                    throw new Error(`لم يتم العثور على الوحدة للمنتج ${item.product.name}`);
                }
                
                const conversionFactor = selectedUnit.unit_quantity;
                const total_base_quantity = item.quantity * conversionFactor;
                const base_unit_purchase_price = item.unit_purchase_price / conversionFactor;

                return {
                    product_id: item.product.id,
                    quantity: total_base_quantity,
                    purchase_price_per_unit: base_unit_purchase_price,
                    expiry_date: item.expiry_date ? format(item.expiry_date, 'yyyy-MM-dd') : null,
                };
            }),
        };
        createPurchaseMutation.mutate(payload);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">إضافة فاتورة شراء</h1>
                    <Button type="button" variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <BackIcon className="h-5 w-5" />
                    </Button>
                </div>

                <Card>
                    <CardHeader><CardTitle>تفاصيل الفاتورة</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="supplier_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>المورد *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingSuppliers}>
                                        <FormControl><SelectTrigger><SelectValue placeholder={isLoadingSuppliers ? "جاري تحميل الموردين..." : "اختر موردًا"} /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {suppliers?.map((supplier: Supplier) => (
                                                <SelectItem key={supplier.id} value={String(supplier.id)}>{supplier.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="invoice_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>تاريخ الفاتورة</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                    {field.value ? format(field.value, "PPP") : <span>اختر تاريخ</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>المنتجات</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {fields.map((field, index) => (
                            <PurchaseItemRow key={field.id} index={index} control={form.control} remove={remove} form={form} />
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => append({ product: null, barcode_id: '', quantity: 1, unit_purchase_price: 0 })}
                        >
                            <Plus className="mr-2 h-4 w-4" /> إضافة منتج آخر
                        </Button>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={createPurchaseMutation.isPending}>
                        {createPurchaseMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        حفظ الفاتورة
                    </Button>
                </div>
            </form>
        </Form>
    );
}
