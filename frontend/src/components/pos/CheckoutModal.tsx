import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Banknote, Wallet, CreditCard, Check, User, 
  MessageCircle, Mail, Printer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export type PaymentMethod = 'cash' | 'wallet' | 'credit';

export interface PaymentDetails {
  method: PaymentMethod;
  walletType?: string;
  transactionCode?: string;
  customerId?: string;
  customerName?: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onConfirmPayment: (details: PaymentDetails) => void;
}

const walletOptions = [
  { value: 'stc_pay', label: 'STC Pay' },
  { value: 'urpay', label: 'UrPay' },
  { value: 'apple_pay', label: 'Apple Pay' },
  { value: 'bank_transfer', label: 'تحويل بنكي' },
];

const mockCustomers = [
  { id: '1', name: 'أحمد محمد' },
  { id: '2', name: 'خالد العبدالله' },
  { id: '3', name: 'سعد السعود' },
  { id: '4', name: 'فهد الفهد' },
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  total,
  onConfirmPayment,
}) => {
  const { t } = useTranslation();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [walletType, setWalletType] = useState('');
  const [transactionCode, setTransactionCode] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [showReceiptOptions, setShowReceiptOptions] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  const handleConfirm = () => {
    if (!selectedMethod) return;

    const details: PaymentDetails = {
      method: selectedMethod,
    };

    if (selectedMethod === 'wallet') {
      details.walletType = walletType;
      details.transactionCode = transactionCode;
    }

    if (selectedMethod === 'credit') {
      const customer = mockCustomers.find(c => c.id === selectedCustomer);
      details.customerId = selectedCustomer;
      details.customerName = customer?.name;
    }

    // Show receipt options after successful payment
    setShowReceiptOptions(true);
    onConfirmPayment(details);
  };

  const handleSendWhatsApp = () => {
    if (!customerPhone) {
      toast.error(t('receipt.enterPhone'));
      return;
    }
    // Format phone number and create WhatsApp link
    const phone = customerPhone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(t('receipt.whatsappMessage', { total: total.toFixed(2) }));
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    toast.success(t('receipt.whatsappSent'));
    handleClose();
  };

  const handleSendEmail = () => {
    if (!customerEmail) {
      toast.error(t('receipt.enterEmail'));
      return;
    }
    // Simulate email sending
    toast.success(t('receipt.emailSent'));
    handleClose();
  };

  const handlePrint = () => {
    toast.success(t('receipt.printing'));
    handleClose();
  };

  const resetForm = () => {
    setSelectedMethod(null);
    setWalletType('');
    setTransactionCode('');
    setSelectedCustomer('');
    setShowReceiptOptions(false);
    setCustomerPhone('');
    setCustomerEmail('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isValid = () => {
    if (!selectedMethod) return false;
    if (selectedMethod === 'wallet' && (!walletType || !transactionCode)) return false;
    if (selectedMethod === 'credit' && !selectedCustomer) return false;
    return true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {showReceiptOptions ? t('receipt.title') : t('payment.title')}
          </DialogTitle>
          <DialogDescription className="text-center">
            {showReceiptOptions ? t('receipt.description') || 'اختر طريقة استلام الفاتورة' : t('payment.description') || 'اختر طريقة الدفع وأكمل العملية'}
          </DialogDescription>
        </DialogHeader>

        {!showReceiptOptions ? (
          <div className="space-y-6">
            {/* Total Amount Display */}
            <div className="bg-primary/10 rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">{t('payment.totalAmount')}</p>
              <p className="text-3xl font-bold text-primary">${total.toFixed(2)}</p>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">{t('payment.selectMethod')}</Label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setSelectedMethod('cash')}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                    selectedMethod === 'cash'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <Banknote className="w-6 h-6 text-green-500" />
                  <span className="text-sm font-medium">{t('payment.cash')}</span>
                </button>
                <button
                  onClick={() => setSelectedMethod('wallet')}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                    selectedMethod === 'wallet'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <Wallet className="w-6 h-6 text-blue-500" />
                  <span className="text-sm font-medium">{t('payment.wallet')}</span>
                </button>
                <button
                  onClick={() => setSelectedMethod('credit')}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                    selectedMethod === 'credit'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <CreditCard className="w-6 h-6 text-orange-500" />
                  <span className="text-sm font-medium">{t('payment.credit')}</span>
                </button>
              </div>
            </div>

            {/* Wallet Payment Details */}
            <AnimatePresence>
              {selectedMethod === 'wallet' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div className="space-y-2">
                    <Label>{t('payment.walletType')}</Label>
                    <Select value={walletType} onValueChange={setWalletType}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('payment.selectWallet')} />
                      </SelectTrigger>
                      <SelectContent>
                        {walletOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('payment.transactionCode')}</Label>
                    <Input
                      value={transactionCode}
                      onChange={(e) => setTransactionCode(e.target.value)}
                      placeholder={t('payment.enterTransactionCode')}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Credit/Debt Details */}
            <AnimatePresence>
              {selectedMethod === 'credit' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div className="space-y-2">
                    <Label>{t('payment.selectCustomer')}</Label>
                    <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('payment.chooseCustomer')} />
                      </SelectTrigger>
                      <SelectContent>
                        {mockCustomers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              {customer.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    {t('payment.creditNote')}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                {t('common.cancel')}
              </Button>
              <Button
                className="flex-1 gradient-primary border-0"
                onClick={handleConfirm}
                disabled={!isValid()}
              >
                <Check className="w-4 h-4 me-2" />
                {t('payment.confirm')}
              </Button>
            </div>
          </div>
        ) : (
          /* Receipt Options */
          <div className="space-y-6">
            <div className="bg-success/10 rounded-xl p-4 text-center">
              <Check className="w-12 h-12 mx-auto text-success mb-2" />
              <p className="text-lg font-bold text-success">{t('receipt.paymentSuccess')}</p>
              <p className="text-2xl font-bold text-foreground mt-2">${total.toFixed(2)}</p>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-medium text-muted-foreground text-center">
                {t('receipt.sendReceipt')}
              </p>

              {/* WhatsApp Option */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder={t('receipt.phonePlaceholder')}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendWhatsApp}
                    className="bg-green-500 hover:bg-green-600 text-white gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {t('receipt.whatsapp')}
                  </Button>
                </div>
              </div>

              {/* Email Option */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder={t('receipt.emailPlaceholder')}
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendEmail}
                    variant="outline"
                    className="gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    {t('receipt.email')}
                  </Button>
                </div>
              </div>

              {/* Print and Close */}
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1 gap-2" onClick={handlePrint}>
                  <Printer className="w-4 h-4" />
                  {t('receipt.print')}
                </Button>
                <Button className="flex-1 gradient-primary border-0" onClick={handleClose}>
                  {t('receipt.done')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
