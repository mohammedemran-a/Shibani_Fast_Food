// frontend/src/pages/POS/POS.tsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import apiClient from '@/api/apiClient';
import { ProductsGrid } from '@/components/pos/ProductsGrid';
import { CartSection, CartItem, Customer } from '@/components/pos/CartSection';
import { CheckoutModal, PaymentDetails } from '@/components/pos/CheckoutModal';
import { toast } from 'sonner';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useDebounce } from '@/hooks/useDebounce';

const POS: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  // --- حالات الواجهة ---
  const [cartItems, setCartItems] = React.useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // --- حالات العملاء ---
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const debouncedCustomerSearch = useDebounce(customerSearch, 300);

  // --- جلب بيانات العملاء ---
  const { data: customersData, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['customers', debouncedCustomerSearch],
    queryFn: async () => {
      const response = await apiClient.get('/customers', {
        params: { search: debouncedCustomerSearch, per_page: 50 },
      });
      return response.data?.data?.data || [];
    },
    placeholderData: (prev) => prev,
  });
  const customers: Customer[] = customersData || [];

  // --- دوال التعامل مع السلة ---
  const handleAddToCart = (product: { id: number; name: string; price: number; image: string }) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success(`${t('pos.addedToCart')} ${product.name}`);
  };

  const handleUpdateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) { handleRemoveItem(id); return; }
    setCartItems(prev => prev.map(item => (item.id === id ? { ...item, quantity } : item)));
  };

  const handleRemoveItem = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
    toast.info(t('pos.cartCleared'));
  };

  // --- دالة الدفع الذكية ---
  const handleCheckout = (method: 'cash' | 'wallet' | 'debt') => {
    if (cartItems.length === 0) {
      toast.error(t('pos.emptyCartError') || 'Cart is empty!');
      return;
    }

    switch (method) {
      case 'cash':
        // للدفع النقدي، قم بالدفع فورًا
        mutate({ payment_method: 'cash', customer_id: selectedCustomer?.id || null });
        break;
      case 'wallet':
        // للدفع بالمحفظة، افتح نافذة المحفظة
        setIsCheckoutOpen(true);
        break;
      case 'debt':
        // للدفع الآجل، تحقق من وجود عميل
        if (selectedCustomer) {
          // إذا تم اختيار عميل، قم بالدفع فورًا
          mutate({ payment_method: 'debt', customer_id: selectedCustomer.id });
        } else {
          // --- تعديل 1: استخدام الترجمة في رسالة الخطأ ---
          // إذا لم يتم اختيار عميل، أظهر تنبيهًا مترجمًا
          toast.error(t('payment.selectCustomerForDebt'));
        }
        break;
    }
  };

  // --- دالة إرسال البيانات إلى الواجهة الخلفية ---
  const handleConfirmPayment = async (details: PaymentDetails) => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.15;
    const total = subtotal + tax;

    try {
      const response = await apiClient.post('/sales-invoices', {
        customer_id: details.customer_id,
        items: cartItems.map(item => ({ product_id: item.id, quantity: item.quantity, price: item.price })),
        subtotal, tax, discount: 0, total,
        payment_method: details.payment_method,
        notes: details.payment_method === 'debt' ? `دين من نقطة البيع` : null,
      });

      toast.success(response.data.message || 'تمت العملية بنجاح');
      setCartItems([]);
      setIsCheckoutOpen(false);
      setSelectedCustomer(null); // إعادة تعيين العميل بعد كل عملية ناجحة
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['debtsSummary'] });
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        toast.error(error.response.data.message || t('common.validation_error'));
      } else {
        toast.error(error.response?.data?.message || error.message || t('common.errorOccurred'));
      }
    }
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 1.15;
  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const { mutate, isPending } = useMutation({ mutationFn: handleConfirmPayment });

  return (
    <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-8rem)] animate-fade-in">
      <div className="flex-1 flex flex-col min-w-0">
        <ProductsGrid onAddToCart={handleAddToCart} />
      </div>

      <div className="w-full md:w-[340px] lg:w-[380px] shrink-0 hidden md:block">
        <CartSection
          items={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onCheckout={handleCheckout}
          customers={customers}
          selectedCustomer={selectedCustomer}
          onSelectCustomer={setSelectedCustomer}
          customerSearch={customerSearch}
          onCustomerSearchChange={setCustomerSearch}
          isLoadingCustomers={isLoadingCustomers}
        />
      </div>

      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetTrigger asChild>
          <Button size="lg" className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 gradient-primary border-0 shadow-2xl px-8 py-6 text-lg gap-3 rounded-full">
            <ShoppingCart className="w-6 h-6" />
            <span>{t('pos.cart')}</span>
            {cartItemsCount > 0 && <span className="bg-white text-primary font-bold px-2.5 py-0.5 rounded-full text-sm">{cartItemsCount}</span>}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[85vh] p-0 flex flex-col">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="text-center">{t('pos.cart')}</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
            <CartSection
              items={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearCart={handleClearCart}
              onCheckout={(method) => {
                setIsCartOpen(false);
                handleCheckout(method);
              }}
              customers={customers}
              selectedCustomer={selectedCustomer}
              onSelectCustomer={setSelectedCustomer}
              customerSearch={customerSearch}
              onCustomerSearchChange={setCustomerSearch}
              isLoadingCustomers={isLoadingCustomers}
            />
          </div>
        </SheetContent>
      </Sheet>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        total={total}
        onConfirmPayment={(details) => {
          // إضافة العميل المختار قبل إرسال البيانات
          mutate({ ...details, customer_id: selectedCustomer?.id || null });
        }}
        isSubmitting={isPending}
      />
    </div>
  );
};

export default POS;
