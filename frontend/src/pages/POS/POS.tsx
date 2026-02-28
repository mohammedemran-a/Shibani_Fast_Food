// src/pages/POS/POS.tsx

import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

// استيراد المكونات المرئية
import { ProductsGrid } from '@/components/pos/ProductsGrid';
import { CartSection } from '@/components/pos/CartSection';
import { CheckoutModal } from '@/components/pos/CheckoutModal';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

// استيراد الـ Hooks التي بنيناها
import { useCart } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useCheckout';

// استيراد الأنواع
import { Customer } from '@/types';

const POS: React.FC = () => {
    // 1. استدعاء الـ Hooks لعزل المنطق والحالة
    const { addToCart, totalItems, subtotal } = useCart();
    const { mutate: processCheckout, isPending: isCheckingOut } = useCheckout();

    // 2. إدارة حالة الواجهة المستخدم المحلية فقط
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
    // ✅ حالة جديدة لتمرير "نبضة" أو "أمر" للتركيز على حقل البحث
    const [focusCustomerSearch, setFocusCustomerSearch] = useState(0);

    // 3. دالة الربط (Handler) التي تربط الواجهة بالمنطق
    const handleCheckoutRequest = (method: 'cash' | 'wallet' | 'debt') => {
        if (totalItems === 0) {
            toast.error('السلة فارغة!');
            return;
        }

        // ✅ تصحيح: إعادة منطق التركيز الذكي الذي صممناه سابقًا
        if (method === 'debt' && !selectedCustomer) {
            toast.info('يرجى اختيار عميل لإتمام عملية الدين.');
            // إرسال "نبضة" عن طريق زيادة العداد، مما سيؤدي إلى تفعيل useEffect في المكون الابن
            setFocusCustomerSearch(c => c + 1); 
            return;
        }

        if (method === 'wallet') {
            setIsCheckoutOpen(true);
        } else {
            // لبقية طرق الدفع، قم بالدفع مباشرة
            processCheckout({
                payment_method: method,
                customer_id: selectedCustomer?.id || null,
            });
        }
    };

    // 4. عرض المكونات وتمرير البيانات والدوال اللازمة
    return (
        <>
            <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-8rem)] animate-fade-in">
                {/* شبكة عرض المنتجات */}
                <div className="flex-1 flex flex-col min-w-0">
                    <ProductsGrid onAddToCart={addToCart} />
                </div>

                {/* قسم السلة للشاشات الكبيرة */}
                <div className="w-full md:w-[380px] lg:w-[420px] shrink-0 hidden md:block">
                    <CartSection
                        onCheckout={handleCheckoutRequest}
                        selectedCustomer={selectedCustomer}
                        onSelectCustomer={setSelectedCustomer}
                        focusCustomerSearch={focusCustomerSearch} // ✅ تمرير "أمر التركيز"
                    />
                </div>

                {/* زر السلة العائم للشاشات الصغيرة */}
                <Sheet open={isMobileCartOpen} onOpenChange={setIsMobileCartOpen}>
                    <SheetTrigger asChild>
                        <Button size="lg" className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 shadow-2xl px-6 py-6 text-base gap-3 rounded-full">
                            <ShoppingCart className="w-6 h-6" />
                            <span>عرض السلة</span>
                            {totalItems > 0 && (
                                <span className="bg-background text-foreground font-bold px-2.5 py-0.5 rounded-full text-sm">
                                    {totalItems}
                                </span>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[90vh] p-0 flex flex-col">
                        <SheetHeader className="p-4 border-b">
                            <SheetTitle className="text-center">سلة المبيعات</SheetTitle>
                        </SheetHeader>
                        <div className="flex-1 overflow-y-auto">
                            <CartSection
                                onCheckout={(method) => {
                                    setIsMobileCartOpen(false);
                                    handleCheckoutRequest(method);
                                }}
                                selectedCustomer={selectedCustomer}
                                onSelectCustomer={setSelectedCustomer}
                                focusCustomerSearch={focusCustomerSearch} // ✅ تمرير "أمر التركيز"
                            />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* نافذة الدفع النهائية (للمحفظة الإلكترونية) */}
            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                total={subtotal * 1.15} // حساب الإجمالي مع الضريبة
                onConfirmPayment={(details) => {
                    processCheckout({
                        ...details,
                        customer_id: selectedCustomer?.id || null,
                    });
                    setIsCheckoutOpen(false);
                }}
                isSubmitting={isCheckingOut}
            />
        </>
    );
};

export default POS;
