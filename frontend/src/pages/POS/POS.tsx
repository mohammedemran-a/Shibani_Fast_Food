// frontend/src/pages/POS/POS.tsx

import React, { useState, useCallback, useMemo } from 'react';
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
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const debouncedCustomerSearch = useDebounce(customerSearch, 300);
  const [focusCustomerSearch, setFocusCustomerSearch] = useState(0);

  // =================================================================
  // **تصحيح 4: استعلام منفصل لجلب العملاء الأخيرين**
  // =================================================================
  const { data: recentCustomers = [] } = useQuery({
    queryKey: ['recentCustomers'],
    queryFn: async () => {
      const response = await apiClient.get('/customers', {
        params: { per_page: 5, sort_by: 'last_purchase' }, // افتراض أن الواجهة الخلفية تدعم هذا الفرز
      });
      return response.data?.data?.data || [];
    },
    staleTime: 5 * 60 * 1000, // تخزين مؤقت لمدة 5 دقائق
  });

  const { data: customers = [], isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['customers_search', debouncedCustomerSearch],
    queryFn: async () => {
      const response = await apiClient.get('/customers', {
        params: { search: debouncedCustomerSearch, per_page: 10 },
      });
      return response.data?.data?.data || [];
    },
    enabled: !!debouncedCustomerSearch, // يتم التشغيل فقط عند وجود نص للبحث
  });

  const handleAddToCart = useCallback((product: { id: number; name: string; price: number; image: string }) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success(`${t('pos.addedToCart')} ${product.name}`);
  }, [t]);

  const handleUpdateQuantity = useCallback((id: number, quantity: number) => {
    setCartItems(prev => {
      if (quantity <= 0) return prev.filter(item => item.id !== id);
      return prev.map(item => (item.id === id ? { ...item, quantity } : item));
    });
  }, []);

  const handleRemoveItem = useCallback((id: number) => setCartItems(prev => prev.filter(item => item.id !== id)), []);

  const handleClearCart = useCallback(() => {
    setCartItems([]);
    setSelectedCustomer(null);
    toast.info(t('pos.cartCleared'));
  }, [t]);

  const handleConfirmPayment = useCallback(async (details: PaymentDetails) => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.15;
    const total = subtotal + tax;
    const payload = {
      customer_id: details.customer_id,
      items: cartItems.map(item => ({ product_id: item.id, quantity: item.quantity, price: item.price })),
      subtotal, tax, discount: 0, total,
      payment_method: details.payment_method,
      walletType: details.walletType,
      transactionCode: details.transactionCode,
      notes: details.payment_method === 'debt' ? `دين من نقطة البيع` : null,
    };
    return apiClient.post('/sales-invoices', payload);
  }, [cartItems]);

  const handleCheckout = useCallback((method: 'cash' | 'wallet' | 'debt') => {
    if (cartItems.length === 0) {
      toast.error(t('pos.emptyCartError') || 'Cart is empty!');
      return;
    }
    switch (method) {
      case 'cash':
        mutate({ payment_method: 'cash', customer_id: selectedCustomer?.id || null });
        break;
      case 'wallet':
        setIsCheckoutOpen(true);
        break;
      case 'debt':
        if (selectedCustomer) {
          mutate({ payment_method: 'debt', customer_id: selectedCustomer.id });
        } else {
          toast.info(t('payment.selectCustomerForDebt'));
          setFocusCustomerSearch(c => c + 1);
        }
        break;
    }
  }, [cartItems, selectedCustomer, t]);

  const { mutate, isPending } = useMutation({
    mutationFn: handleConfirmPayment,
    onSuccess: (response) => {
      toast.success(response.data.message || 'تمت العملية بنجاح');
      handleClearCart();
      setIsCheckoutOpen(false);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
      queryClient.invalidateQueries({ queryKey: ['recentCustomers'] }); // تحديث قائمة العملاء الأخيرين
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || t('common.errorOccurred');
      toast.error(message);
    },
  });

  const total = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 1.15, [cartItems]);
  const cartItemsCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems]);

  return (
    <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-8rem)] animate-fade-in">
      <div className="flex-1 flex flex-col min-w-0"><ProductsGrid onAddToCart={handleAddToCart} /></div>
      <div className="w-full md:w-[340px] lg:w-[380px] shrink-0 hidden md:block">
        <CartSection
          focusCustomerSearch={focusCustomerSearch}
          items={cartItems} onUpdateQuantity={handleUpdateQuantity} onRemoveItem={handleRemoveItem} onClearCart={handleClearCart} onCheckout={handleCheckout}
          customers={customers}
          recentCustomers={recentCustomers} // **تصحيح 5: تمرير قائمة العملاء الأخيرين**
          selectedCustomer={selectedCustomer} onSelectCustomer={setSelectedCustomer} customerSearch={customerSearch} onCustomerSearchChange={setCustomerSearch} isLoadingCustomers={isLoadingCustomers}
        />
      </div>
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetTrigger asChild><Button size="lg" className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 gradient-primary border-0 shadow-2xl px-8 py-6 text-lg gap-3 rounded-full"><ShoppingCart className="w-6 h-6" /><span>{t('pos.cart')}</span>{cartItemsCount > 0 && <span className="bg-white text-primary font-bold px-2.5 py-0.5 rounded-full text-sm">{cartItemsCount}</span>}</Button></SheetTrigger>
        <SheetContent side="bottom" className="h-[85vh] p-0 flex flex-col">
          <SheetHeader className="p-4 border-b"><SheetTitle className="text-center">{t('pos.cart')}</SheetTitle></SheetHeader>
          <div className="flex-1 overflow-y-auto">
            <CartSection
              focusCustomerSearch={focusCustomerSearch}
              items={cartItems} onUpdateQuantity={handleUpdateQuantity} onRemoveItem={handleRemoveItem} onClearCart={handleClearCart} onCheckout={(method) => { setIsCartOpen(false); handleCheckout(method); }}
              customers={customers}
              recentCustomers={recentCustomers}
              selectedCustomer={selectedCustomer} onSelectCustomer={setSelectedCustomer} customerSearch={customerSearch} onCustomerSearchChange={setCustomerSearch} isLoadingCustomers={isLoadingCustomers}
            />
          </div>
        </SheetContent>
      </Sheet>
      <CheckoutModal
        isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} total={total}
        onConfirmPayment={(details) => { mutate({ ...details, customer_id: selectedCustomer?.id || null }); }}
        isSubmitting={isPending}
      />
    </div>
  );
};

export default POS;
