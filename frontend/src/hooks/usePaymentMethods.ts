import { useQuery } from '@tanstack/react-query';
import { paymentMethodService } from '@/api/paymentMethodService';

/**
 * Hook مخصص لجلب قائمة طرق الدفع (المحافظ) النشطة فقط.
 * يستخدم الدالة getActive() المُحسَّنة من الخدمة.
 * مع تخزين مؤقت لمدة ساعة لتقليل استدعاءات الشبكة.
 */
export const usePaymentMethods = () => {
  return useQuery({
    queryKey: ['active-payment-methods'],
    // **التصحيح: استدعاء الدالة الصحيحة**
    queryFn: () => paymentMethodService.getActive(), 
    staleTime: 1000 * 60 * 60, // 1 hour
    // **إضافة:** التأكد من عدم إعادة الجلب عند التركيز على النافذة
    refetchOnWindowFocus: false,
  });
};
