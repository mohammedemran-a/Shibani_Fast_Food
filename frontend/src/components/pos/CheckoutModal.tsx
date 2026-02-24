import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { Skeleton } from '@/components/ui/skeleton';

// الواجهات تبقى كما هي
export type PaymentMethod = 'cash' | 'wallet' | 'debt';
export interface PaymentDetails {
  payment_method: PaymentMethod;
  walletType?: string;
  transactionCode?: string;
  customer_id?: number | null;
}
interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onConfirmPayment: (details: PaymentDetails) => void;
  isSubmitting: boolean;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  total,
  onConfirmPayment,
  isSubmitting,
}) => {
  const { t } = useTranslation();
  
  const { data: walletsResponse, isLoading: isLoadingWallets } = usePaymentMethods();
  const wallets = walletsResponse || []; // التأكد من أن wallets دائمًا مصفوفة

  const [walletType, setWalletType] = useState('');
  const [transactionCode, setTransactionCode] = useState('');

  const handleWalletConfirm = () => {
    if (!walletType || !transactionCode) {
      toast.error(t('pos.fillWalletDetails') || 'Please fill all wallet details.');
      return;
    }
    onConfirmPayment({
      payment_method: 'wallet',
      walletType,
      transactionCode,
    });
  };

  const resetForm = () => {
    setWalletType('');
    setTransactionCode('');
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">{t('payment.walletPayment')}</DialogTitle>
          <DialogDescription className="text-center">${total.toFixed(2)}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          {isLoadingWallets ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="space-y-2">
              <Label>{t('payment.walletType')}</Label>
              <Select value={walletType} onValueChange={setWalletType}>
                <SelectTrigger><SelectValue placeholder={t('payment.selectWallet')} /></SelectTrigger>
                <SelectContent>
                  {wallets.map((wallet: any) => (
                    <SelectItem key={wallet.id} value={wallet.name}>{wallet.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label>{t('payment.transactionCode')}</Label>
            <Input value={transactionCode} onChange={(e) => setTransactionCode(e.target.value)} placeholder={t('payment.enterTransactionCode')} />
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={handleClose} disabled={isSubmitting}>{t('common.cancel')}</Button>
            <Button className="flex-1 gradient-primary border-0" onClick={handleWalletConfirm} disabled={!walletType || !transactionCode || isSubmitting || isLoadingWallets}>
              {isSubmitting ? <Loader2 className="w-4 h-4 me-2 animate-spin" /> : <Check className="w-4 h-4 me-2" />}
              {t('payment.confirm')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
