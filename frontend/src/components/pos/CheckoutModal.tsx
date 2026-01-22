// frontend/src/components/pos/CheckoutModal.tsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

// واجهة لأنواع الدفع
export type PaymentMethod = 'cash' | 'wallet' | 'debt';

// واجهة لتفاصيل الدفع
export interface PaymentDetails {
  payment_method: PaymentMethod;
  walletType?: string;
  transactionCode?: string;
  customer_id?: number | null;
}

// واجهة لخصائص المكون
interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onConfirmPayment: (details: PaymentDetails) => void;
  isSubmitting: boolean;
}

// قائمة خيارات المحافظ
const walletOptions = [
  { value: 'stc_pay', label: 'STC Pay' },
  { value: 'urpay', label: 'UrPay' },
  { value: 'apple_pay', label: 'Apple Pay' },
  { value: 'bank_transfer', label: 'تحويل بنكي' },
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  total,
  onConfirmPayment,
  isSubmitting,
}) => {
  const { t } = useTranslation();
  
  // حالات خاصة بالمحفظة
  const [walletType, setWalletType] = useState('');
  const [transactionCode, setTransactionCode] = useState('');

  // دالة تأكيد الدفع للمحفظة
  const handleWalletConfirm = () => {
    if (!walletType || !transactionCode) {
      toast.error(t('pos.fillWalletDetails') || 'Please fill all wallet details.');
      return;
    }
    // استدعاء الدالة مع تحديد النوع "wallet"
    onConfirmPayment({
      payment_method: 'wallet',
      walletType,
      transactionCode,
    });
  };

  // دالة إعادة تعيين الحقول
  const resetForm = () => {
    setWalletType('');
    setTransactionCode('');
  };

  // دالة الإغلاق
  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {/* هذا المكون الآن يعرض فقط محتوى الدفع بالمحفظة */}
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">{t('payment.walletPayment')}</DialogTitle>
          <DialogDescription className="text-center">${total.toFixed(2)}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>{t('payment.walletType')}</Label>
            <Select value={walletType} onValueChange={setWalletType}>
              <SelectTrigger><SelectValue placeholder={t('payment.selectWallet')} /></SelectTrigger>
              <SelectContent>
                {walletOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('payment.transactionCode')}</Label>
            <Input value={transactionCode} onChange={(e) => setTransactionCode(e.target.value)} placeholder={t('payment.enterTransactionCode')} />
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={handleClose} disabled={isSubmitting}>{t('common.cancel')}</Button>
            <Button className="flex-1 gradient-primary border-0" onClick={handleWalletConfirm} disabled={!walletType || !transactionCode || isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 me-2 animate-spin" /> : <Check className="w-4 h-4 me-2" />}
              {t('payment.confirm')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
