import { useMutation, useQueryClient } from '@tanstack/react-query';
import { salesService, CreateSalesInvoiceRequest } from '../api/salesService';
import { useCartStore } from './useCartStore';
import { toast } from 'sonner';
import { useMemo } from 'react';
import { DiscountType } from '../types';

export interface RestaurantCheckoutPayload {
  paymentMethod: 'cash' | 'wallet';
  paymentDetails?: {
    walletProvider: string;
    transactionCode: string;
  };
}

export const useCheckout = () => {
  const queryClient = useQueryClient();
  const { items, orderType, discountType, discountValue, clearCart } = useCartStore();

  const calculations = useMemo(() => {
    const subtotal = items.reduce((total, item) => {
      const modifiersPrice = item.selectedModifiers?.reduce((modTotal, mod) => modTotal + mod.price, 0) || 0;
      const itemTotal = (item.price + modifiersPrice) * item.quantity;
      return total + itemTotal;
    }, 0);

    let totalDiscount = 0;
    if (discountType === DiscountType.Percentage) {
      const percentage = Math.min(100, discountValue);
      totalDiscount = (subtotal * percentage) / 100;
    } else if (discountType === DiscountType.FixedAmount) {
      totalDiscount = Math.min(subtotal, discountValue);
    }

    const totalAmount = subtotal - totalDiscount;

    return { subtotal, totalDiscount, totalAmount };
  }, [items, discountType, discountValue]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: RestaurantCheckoutPayload) => {
      if (items.length === 0) {
        return Promise.reject(new Error('السلة فارغة. لا يمكن إتمام العملية.'));
      }

      // ✅✅✅ التصحيح الجذري لحمولة الطلب ✅✅✅
      const invoicePayload: CreateSalesInvoiceRequest = {
        invoice_date: new Date().toISOString(),
        payment_method: payload.paymentMethod,
        items: items.map(item => ({
          product_id: parseInt(item.id, 10),
          quantity: item.quantity,
          unit_price: item.price,
        })),
        // إضافة الحقول المطلوبة من الواجهة الخلفية
        subtotal: calculations.subtotal, // ✅ إضافة المجموع الفرعي
        discount_amount: calculations.totalDiscount,
        total_amount: calculations.totalAmount, // ✅ إضافة الإجمالي النهائي
        notes: `طلب ${orderType}`,
        ...(payload.paymentMethod === 'wallet' && {
          wallet_name: payload.paymentDetails?.walletProvider,
          transaction_code: payload.paymentDetails?.transactionCode,
        }),
      };
      
      return salesService.createSalesInvoice(invoicePayload);
    },
    onSuccess: (response) => {
      toast.success(response.message || 'تم إنشاء الطلب بنجاح!');
      clearCart();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'حدث خطأ أثناء إتمام العملية.';
      toast.error(message);
    },
  });

  return { 
    processCheckout: mutate, 
    isPending,
    ...calculations
  };
};
