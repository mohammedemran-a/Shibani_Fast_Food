import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/apiClient';
import { ProductsGrid } from '@/components/pos/ProductsGrid';
import { CartSection, CartItem } from '@/components/pos/CartSection';
import { CheckoutModal, PaymentDetails } from '@/components/pos/CheckoutModal';
import { toast } from 'sonner';
import { printInvoice } from '@/utils/printService';

const POS: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [cartItems, setCartItems] = React.useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

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
        notes: details.method === 'credit' ? `العميل: ${details.customerName}` : null,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'فشل في إتمام عملية البيع');
      }

      // الحصول على بيانات الفاتورة من الاستجابة
      const invoiceData = response.data.data;

      let message = '';
      switch (details.method) {
        case 'cash':
          message = `${t('payment.cashSuccess')} - $${total.toFixed(2)}`;
          break;
        case 'wallet':
          message = `${t('payment.walletSuccess')} ${details.walletType} - $${total.toFixed(2)}`;
          break;
        case 'credit':
          message = `${t('payment.creditSuccess')} ${details.customerName}`;
          break;
      }

      toast.success(message);
      
      // طباعة الفاتورة تلقائياً
      if (invoiceData) {
        printInvoice({
          invoice_number: invoiceData.invoice_number,
          invoice_date: invoiceData.invoice_date || new Date().toISOString(),
          customer_name: invoiceData.customer?.name,
          items: invoiceData.items.map((item: any) => ({
            product_name: item.product?.name || 'منتج',
            quantity: item.quantity,
            unit_price: parseFloat(item.unit_price),
            total_price: parseFloat(item.total_price),
          })),
          subtotal: parseFloat(invoiceData.subtotal),
          tax_amount: parseFloat(invoiceData.tax_amount),
          discount_amount: parseFloat(invoiceData.discount_amount),
          total_amount: parseFloat(invoiceData.total_amount),
          payment_method: invoiceData.payment_method,
          notes: invoiceData.notes,
        });
      }
      
      setCartItems([]);
      setIsCheckoutOpen(false);
      // Refresh products to update stock
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete sale');
    }
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 1.15;

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4 animate-fade-in">
      {/* Products Section */}
      <div className="flex-1 flex flex-col">
        <ProductsGrid onAddToCart={handleAddToCart} />
      </div>

      {/* Cart Section */}
      <div className="w-full max-w-sm hidden md:block">
        <CartSection
          items={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onCheckout={handleCheckout}
        />
      </div>

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
