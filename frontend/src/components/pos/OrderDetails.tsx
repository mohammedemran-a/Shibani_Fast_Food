import React, { useState } from 'react';
import { useCartStore } from '../../hooks/useCartStore';
import { useSuspendedOrdersStore } from '../../hooks/useSuspendedOrdersStore';
import { useCheckout } from '../../hooks/useCheckout';
import OrderTypeSelector from './OrderTypeSelector';
import CartItemCard from './CartItemCard';
import { CheckoutModal } from './CheckoutModal';
import type { PaymentDetails } from './CheckoutModal';
import { Receipt, Pause, Play, List, Loader2, Tag, Percent } from 'lucide-react';
import { DiscountType } from '../../types';

const OrderDetails: React.FC = () => {
  const { items, orderType, applyDiscount, discountType, discountValue } = useCartStore();
  const { suspendedOrders, suspendCurrentOrder, resumeOrder } = useSuspendedOrdersStore();
  const { processCheckout, isPending, totalAmount, totalDiscount, subtotal } = useCheckout();

  const [showSuspended, setShowSuspended] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [showDiscountInput, setShowDiscountInput] = useState(false);

  const handleCashCheckout = () => {
    processCheckout({ paymentMethod: 'cash' });
  };

  const handleConfirmPayment = (details: PaymentDetails) => {
    processCheckout({
      paymentMethod: 'wallet',
      paymentDetails: {
        walletProvider: details.walletType || '',
        transactionCode: details.transactionCode || '',
      },
    });
    setIsCheckoutModalOpen(false);
  };

  if (!orderType) {
    return <OrderTypeSelector />;
  }

  return (
    <>
      <div className="bg-card rounded-lg shadow-lg h-full flex flex-col">
        {/* ================================================================== */}
        {/* ✅✅✅ الجزء العلوي الذي كان مفقودًا - تمت إعادته بالكامل ✅✅✅ */}
        {/* ================================================================== */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">طلب {orderType}</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowSuspended(!showSuspended)} className="relative p-2 hover:bg-muted rounded-full">
              <List size={20} />
              {suspendedOrders.length > 0 && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-primary ring-2 ring-white" />
              )}
            </button>
            <button onClick={suspendCurrentOrder} className="p-2 hover:bg-muted rounded-full" title="تعليق الطلب الحالي">
              <Pause size={20} />
            </button>
          </div>
        </div>
        {showSuspended && (
          <div className="p-2 border-b bg-muted/50">
            <h3 className="font-semibold mb-2">الطلبات المعلقة</h3>
            {suspendedOrders.length > 0 ? (
              <div className="space-y-2">
                {suspendedOrders.map(order => (
                  <div key={order.id} className="flex justify-between items-center p-2 bg-background rounded-md">
                    <span>{order.name} ({order.cartState.items.length} منتجات)</span>
                    <button onClick={() => { resumeOrder(order.id); setShowSuspended(false); }} className="p-1 text-primary hover:bg-primary/10 rounded-full">
                      <Play size={18} />
                    </button>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-center text-muted-foreground">لا توجد طلبات معلقة.</p>}
          </div>
        )}
        <div className="flex-grow overflow-y-auto p-3 space-y-3 bg-muted/30">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Receipt size={48} className="mb-4" />
              <p className="font-semibold">السلة فارغة</p>
              <p className="text-sm">ابدأ بإضافة المنتجات</p>
            </div>
          ) : (
            items.map(item => <CartItemCard key={item.cartItemId} item={item} />)
          )}
        </div>
        {/* ================================================================== */}
        {/* نهاية الجزء الذي كان مفقودًا */}
        {/* ================================================================== */}

        <div className="p-4 border-t bg-background">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>المجموع الفرعي</span>
              <span>{subtotal.toFixed(2)} ر.ي</span>
            </div>
            <div className="flex justify-between items-center">
              <span 
                className="text-primary cursor-pointer hover:underline flex items-center gap-1"
                onClick={() => setShowDiscountInput(!showDiscountInput)}
              >
                <Tag size={16} /> الخصم
              </span>
              <span className="text-red-500">-{totalDiscount.toFixed(2)} ر.ي</span>
            </div>
            {showDiscountInput && (
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="number"
                  className="w-full p-2 border rounded-md text-left"
                  placeholder="قيمة الخصم"
                  value={discountValue || ''}
                  onChange={(e) => applyDiscount(discountType, parseFloat(e.target.value) || 0)}
                />
                <button 
                  className={`p-2 border rounded-md ${discountType === DiscountType.Percentage ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() => applyDiscount(DiscountType.Percentage, discountValue)}
                ><Percent size={16} /></button>
                <button 
                  className={`p-2 border rounded-md ${discountType === DiscountType.FixedAmount ? 'bg-primary text-primary-foreground' : ''}`}
                  onClick={() => applyDiscount(DiscountType.FixedAmount, discountValue)}
                >ر.ي</button>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center mb-4 border-t pt-4">
            <span className="text-lg font-semibold">الإجمالي النهائي</span>
            <span className="text-2xl font-bold text-primary">{totalAmount.toFixed(2)} ر.ي</span>
          </div>
          
          {isPending ? (
            <div className="flex justify-center items-center h-12">
              <Loader2 className="animate-spin text-primary" size={28} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsCheckoutModalOpen(true)}
                disabled={items.length === 0}
                className="w-full bg-secondary text-secondary-foreground py-3 rounded-lg font-bold text-lg disabled:opacity-50"
              >
                دفع محفظة
              </button>
              <button
                onClick={handleCashCheckout}
                disabled={items.length === 0}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold text-lg disabled:opacity-50"
              >
                دفع نقدي
              </button>
            </div>
          )}
        </div>
      </div>

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        total={totalAmount}
        onConfirmPayment={handleConfirmPayment}
        isSubmitting={isPending}
      />
    </>
  );
};

export default OrderDetails;
