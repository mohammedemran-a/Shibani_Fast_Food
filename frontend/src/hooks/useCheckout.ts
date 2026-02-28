// src/hooks/useCheckout.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/apiClient';
import { toast } from 'sonner';
import { useCart } from './useCart';
import { Customer } from '@/types';

export interface CheckoutDetails {
    payment_method: 'cash' | 'wallet' | 'debt';
    customer_id: number | null;
    walletType?: string;
    transactionCode?: string;
}

export const useCheckout = () => {
    const queryClient = useQueryClient();

    const checkoutMutation = useMutation({
        mutationFn: async (details: CheckoutDetails) => {
            // الوصول إلى الحالة الحالية للسلة عند التنفيذ
            const { items, subtotal } = useCart.getState();

            if (items.length === 0) {
                return Promise.reject(new Error('السلة فارغة. لا يمكن إتمام العملية.'));
            }

            const taxRate = 0.15;
            const taxAmount = subtotal * taxRate;
            const totalAmount = subtotal + taxAmount;

            const invoicePayload = {
                customer_id: details.customer_id,
                payment_method: details.payment_method,
                subtotal: subtotal,
                tax: taxAmount,
                total: totalAmount,
                discount: 0,
                notes: details.payment_method === 'debt' ? 'فاتورة دين من نقطة البيع' : '',
                
                // ✅ =================================================
                // ✅ التصحيح الجذري والنهائي
                // ✅ =================================================
                items: items.map(item => ({
                    product_id: item.product_id,
                    barcode_id: item.barcode_id, // ✅ إرسال barcode_id (مفتاح منطق FIFO)
                    quantity: item.quantity,
                    unit_price: item.selling_price, // إرسال سعر الوحدة المباعة
                })),
                
                ...(details.payment_method === 'wallet' && {
                    wallet_type: details.walletType,
                    transaction_code: details.transactionCode,
                }),
            };

            // هذا هو السطر الذي يسبب الخطأ (useCheckout.ts:51)
            return apiClient.post('/sales-invoices', invoicePayload);
        },

        onSuccess: (response) => {
            toast.success(response.data.message || 'تمت عملية البيع بنجاح!');
            
            // الوصول إلى دالة مسح السلة
            const { clearCart } = useCart.getState();
            clearCart(); 
            
            // إعادة تحميل البيانات الحيوية
            queryClient.invalidateQueries({ queryKey: ['pos_products'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
            queryClient.invalidateQueries({ queryKey: ['recentCustomers'] });
        },

        onError: (error: any) => {
            // عرض رسالة خطأ واضحة للمستخدم
            const message = error.response?.data?.message || error.message || 'حدث خطأ أثناء إتمام العملية.';
            toast.error(message);
        },
    });

    return checkoutMutation;
};
