import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useProduct } from '@/hooks/useProducts';
import ProductForm from './ProductForm'; // تأكد من أن المسار صحيح
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

export default function EditProduct() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isRTL } = useTheme();
    const BackIcon = isRTL ? ArrowRight : ArrowLeft;

    // الخطوة 1: جلب البيانات
    const { data: productData, isLoading, isError } = useProduct(Number(id!));

    // الخطوة 2: تحويل البيانات (لن يتم تشغيله إلا بعد وصول البيانات)
    const formattedProductData = useMemo(() => {
        if (!productData?.data) return null; // **مهم جدًا: إرجاع null إذا لم تكن البيانات موجودة**

        const product = productData.data;
        
        const baseBarcode = product.barcodes.find(b => b.is_base_unit);
        const additionalBarcodes = product.barcodes.filter(b => !b.is_base_unit);

        return {
            id: product.id,
            name: product.name,
            category_id: String(product.category_id),
            brand_id: product.brand_id ? String(product.brand_id) : undefined,
            product_type: product.product_type,
            description: product.description ?? '',
            sku: product.sku ?? '',
            reorder_level: product.reorder_level,
            is_active: product.is_active,
            image_url: product.image_url,
            stock_batches: product.stock_batches,
            base_unit: {
                name: baseBarcode?.unit_name || '',
                barcode: baseBarcode?.barcode || '',
            },
            base_selling_price: baseBarcode?.selling_price ?? 0,
            additional_units: additionalBarcodes.map(unit => ({
                id: unit.id,
                name: unit.unit_name,
                conversion_factor: unit.unit_quantity,
                barcode: unit.barcode ?? '',
                selling_price: unit.selling_price,
            })),
        };
    }, [productData]);

    // الخطوة 3: عرض شاشة التحميل إذا كانت البيانات قيد الجلب
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="ml-2">جاري تحميل بيانات المنتج...</p>
            </div>
        );
    }

    // الخطوة 4: عرض رسالة خطأ إذا فشل الجلب أو لم يتم العثور على البيانات
    if (isError || !formattedProductData) {
        return (
            <div className="text-center py-12">
                <p className="text-destructive mb-4">فشل في تحميل المنتج أو أن المنتج غير موجود.</p>
                <Button onClick={() => navigate('/products')}>العودة إلى القائمة</Button>
            </div>
        );
    }

    // الخطوة 5: عرض الفورم فقط عندما تكون البيانات جاهزة ومُهيأة
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <BackIcon className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">تعديل المنتج</h1>
                    <p className="text-muted-foreground mt-1">تحديث بيانات: {formattedProductData.name}</p>
                </div>
            </div>
            
            {/* **الضمانة النهائية**: نحن لا نعرض ProductForm إلا إذا كانت formattedProductData تحتوي على بيانات حقيقية */}
            <ProductForm existingProduct={formattedProductData} />
        </div>
    );
}
