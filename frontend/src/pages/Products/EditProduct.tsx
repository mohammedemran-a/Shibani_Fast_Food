import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';

// ✅ الخطوة 1: استيراد الـ hook الموجود (بالجمع)
import { useProducts } from '@/hooks/useProducts'; 

import ProductForm from './ProductForm';
import { Button } from '@/components/ui/button';

export default function EditProduct() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // ✅ الخطوة 2: استخدام الـ hook الموجود لجلب قائمة كل المنتجات
    // نحن لا نستخدم الفلاتر هنا، لذلك سيعيد كل المنتجات
    const { products, loading, error } = useProducts();

    // ✅ الخطوة 3: البحث عن المنتج المطلوب داخل القائمة التي تم جلبها
    // نستخدم Number(id) للتأكد من أننا نقارن أرقامًا
    const productToEdit = products.find(p => p.id === Number(id));

    // ✅ الخطوة 4: عرض شاشة التحميل أثناء جلب القائمة الكاملة
    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="ml-2">جاري تحميل بيانات المنتج...</p>
            </div>
        );
    }

    // ✅ الخطوة 5: عرض رسالة خطأ إذا فشل جلب القائمة أو لم يتم العثور على المنتج
    if (error || !productToEdit) {
        return (
            <div className="text-center py-12">
                <p className="text-destructive mb-4">
                    {error ? `فشل في تحميل المنتجات. السبب: ${error}` : 'لم يتم العثور على المنتج المطلوب.'}
                </p>
                <Button onClick={() => navigate('/products')}>العودة إلى القائمة</Button>
            </div>
        );
    }

    // ✅ الخطوة 6: عرض الفورم وتمرير المنتج الذي تم العثور عليه
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">تعديل المنتج</h1>
                    <p className="text-muted-foreground mt-1">تحديث بيانات: {productToEdit?.name}</p>
                </div>
            </div>
            
            {/* تمرير المنتج الذي تم العثور عليه في القائمة إلى الفورم */}
            <ProductForm existingProduct={productToEdit} />
        </div>
    );
}
