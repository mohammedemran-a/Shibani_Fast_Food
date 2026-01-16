import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/apiClient';
import { ProductsGrid } from '@/components/pos/ProductsGrid';
import { CartSection, CartItem } from '@/components/pos/CartSection';
import { CheckoutModal, PaymentDetails } from '@/components/pos/CheckoutModal';
import { toast } from 'sonner';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';


const POS: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [cartItems, setCartItems] = React.useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleAddToCart = (product: { id: number; name: string; price: number; image: string }) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success(`${t('pos.addedToCart')} ${product.name}`);
  };

  const handleUpdateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(id);
      return;
    }
    setCartItems(prev =>
      prev.map(item => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const handleRemoveItem = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
    toast.info(t('pos.cartCleared'));
  };

  const handleCheckout = () => {
    setIsCheckoutOpen(true);
  };

  const handleConfirmPayment = async (details: PaymentDetails) => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.15;
    const total = subtotal + tax;

    try {
      // Create sales invoice using apiClient for better error handling and environment compatibility
      const response = await apiClient.post('/sales-invoices', {
        customer_id: details.customerId,
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal,
        tax,
        discount: 0,
        total,
        payment_method: details.method === 'wallet' ? 'card' : details.method,
        notes: details.method === 'credit' ? `الدفع الآجل - العميل: ${details.customerName}` : null,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'فشل في إتمام عملية البيع');
      }

      let message = '';
      switch (details.method) {
        case 'cash':
          message = `تم الدفع نقداً بنجاح - $${total.toFixed(2)}`;
          break;
        case 'wallet':
          message = `تم الدفع عبر ${details.walletType} بنجاح - $${total.toFixed(2)}`;
          break;
        case 'credit':
          message = `تم تسجيل الدين على ${details.customerName} بنجاح`;
          break;
      }

      toast.success(message);
      
      setCartItems([]);
      // Refresh products to update stock
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (error: any) {
      toast.error(error.message || 'فشل في إتمام عملية البيع');
      throw error;
    }
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 1.15;

  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4 animate-fade-in relative">
      {/* Products Section */}
      <div className="flex-1 flex flex-col">
        <ProductsGrid onAddToCart={handleAddToCart} />
      </div>

      {/* Cart Section - Desktop */}
      <div className="w-full max-w-sm hidden md:block">
        <CartSection
          items={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onCheckout={handleCheckout}
        />
      </div>

      {/* Floating Cart Button - Mobile */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetTrigger asChild>
          <Button
            size="lg"
            className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 gradient-primary border-0 shadow-2xl px-8 py-6 text-lg gap-3 rounded-full"
          >
            <ShoppingCart className="w-6 h-6" />
            <span>السلة</span>
            {cartItemsCount > 0 && (
              <span className="bg-white text-primary font-bold px-2.5 py-0.5 rounded-full text-sm">
                {cartItemsCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[85vh] p-0">
          <CartSection
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onCheckout={() => {
              setIsCartOpen(false);
              handleCheckout();
            }}
          />
        </SheetContent>
      </Sheet>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        total={total}
        onConfirmPayment={handleConfirmPayment}
      />
    </div>
  );
};

export default POS;
