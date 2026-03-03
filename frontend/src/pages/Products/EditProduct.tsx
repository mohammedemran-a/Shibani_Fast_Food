import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';

// ✅✅✅ هذا هو التعديل المطلوب: تم تغيير مسار الاستيراد ✅✅✅
import { useProduct } from '@/hooks/useProducts'; 

import ProductForm from './ProductForm';
import { Button } from '@/components/ui/button';

export default function EditProduct() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // استخدام الـ hook المخصص لجلب منتج واحد فقط
    const { data: product, isLoading, isError, error } = useProduct(id);

    // عرض شاشة التحميل أثناء جلب المنتج المحدد
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="ml-2">جاري تحميل بيانات المنتج...</p>
            </div>
        );
    }

    // عرض رسالة خطأ إذا فشل جلب المنتج
    if (isError) {
        return (
            <div className="text-center py-12">
                <p className="text-destructive mb-4">
                    فشل في تحميل المنتج. السبب: {error.message}
                </p>
                <Button onClick={() => navigate('/products')}>العودة إلى القائمة</Button>
            </div>
        );
    }

    // عرض الفورم وتمرير المنتج الكامل الذي تم جلبه
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">تعديل المنتج</h1>
                    <p className="text-muted-foreground mt-1">تحديث بيانات: {product?.name}</p>
                </div>
            </div>
            
            {/* تمرير المنتج الكامل إلى الفورم */}
            <ProductForm existingProduct={product} />
        </div>
    );
}
