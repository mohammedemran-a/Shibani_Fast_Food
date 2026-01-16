import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tantml:parameter>
import apiClient from '@/api/apiClient';
import { 
  X, Banknote, Wallet, CreditCard, Check, User, 
  MessageCircle, Mail, Printer, Search
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export type PaymentMethod = 'cash' | 'wallet' | 'credit';

export interface PaymentDetails {
  method: PaymentMethod;
  walletType?: string;
  transactionCode?: string;
  customerId?: number | null;
  customerName?: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onConfirmPayment: (details: PaymentDetails) => void;
}

interface Customer {
  id: number;
  name: string;
  phone?: string;
  email?: string;
}

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
}) => {
  const { t } = useTranslation();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [walletType, setWalletType] = useState('');
  const [transactionCode, setTransactionCode] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [openCustomerSelect, setOpenCustomerSelect] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  // جلب العملاء من قاعدة البيانات
  const { data: customersData, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['customers', customerSearch],
    queryFn: async () => {
      const response = await apiClient.get('/customers', {
        params: {
          search: customerSearch,
          per_page: 50,
        },
      });
      return response.data.data || [];
    },
    enabled: isOpen,
  });

  const customers: Customer[] = customersData || [];

  const handleConfirm = () => {
    if (!selectedMethod) return;

    const details: PaymentDetails = {
      method: selectedMethod,
      customerId: selectedCustomer?.id || null,
      customerName: selectedCustomer?.name || 'عميل عابر',
    };

    if (selectedMethod === 'wallet') {
      details.walletType = walletType;
      details.transactionCode = transactionCode;
    }

    if (selectedMethod === 'credit' && !selectedCustomer) {
      toast.error('يجب اختيار عميل للدفع الآجل');
      return;
    }

    onConfirmPayment(details);
    setShowSuccessScreen(true);
  };

  const handlePrint = () => {
    toast.success('جاري الطباعة...');
    handleClose();
  };

  const handleBackToPOS = () => {
    handleClose();
  };

  const resetForm = () => {
    setSelectedMethod(null);
    setWalletType('');
    setTransactionCode('');
    setSelectedCustomer(null);
    setCustomerSearch('');
    setShowSuccessScreen(false);
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
            {showSuccessScreen ? 'تمت العملية بنجاح' : 'إتمام عملية البيع'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {showSuccessScreen ? 'اختر الإجراء التالي' : 'اختر العميل وطريقة الدفع'}
          </DialogDescription>
        </DialogHeader>

        {!showSuccessScreen ? (
          <div className="space-y-6">
            {/* Total Amount Display */}
            <div className="bg-primary/10 rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">المبلغ الإجمالي</p>
              <p className="text-3xl font-bold text-primary">${total.toFixed(2)}</p>
            </div>

            {/* Customer Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">العميل</Label>
              <Popover open={openCustomerSelect} onOpenChange={setOpenCustomerSelect}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCustomerSelect}
                    className="w-full justify-between"
                  >
                    {selectedCustomer ? (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {selectedCustomer.name}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">عميل عابر (افتراضي)</span>
                    )}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="ابحث عن عميل..." 
                      value={customerSearch}
                      onValueChange={setCustomerSearch}
                    />
                    <CommandEmpty>
                      {isLoadingCustomers ? 'جاري التحميل...' : 'لا يوجد عملاء'}
                    </CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      <CommandItem
                        onSelect={() => {
                          setSelectedCustomer(null);
                          setOpenCustomerSelect(false);
                        }}
                      >
                        <User className="mr-2 h-4 w-4" />
                        <span>عميل عابر</span>
                      </CommandItem>
                      {customers.map((customer) => (
                        <CommandItem
                          key={customer.id}
                          onSelect={() => {
                            setSelectedCustomer(customer);
                            setOpenCustomerSelect(false);
                          }}
                        >
                          <User className="mr-2 h-4 w-4" />
                          <div className="flex flex-col">
                            <span>{customer.name}</span>
                            {customer.phone && (
                              <span className="text-xs text-muted-foreground">{customer.phone}</span>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedCustomer && (
                <p className="text-xs text-muted-foreground">
                  سيتم حساب نقاط الولاء لهذا العميل
                </p>
              )}
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">طريقة الدفع</Label>
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
                  <span className="text-sm font-medium">نقدي</span>
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
                  <span className="text-sm font-medium">محفظة</span>
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
                  <span className="text-sm font-medium">آجل</span>
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
                    <Label>نوع المحفظة</Label>
                    <Select value={walletType} onValueChange={setWalletType}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المحفظة" />
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
                    <Label>رمز العملية</Label>
                    <Input
                      value={transactionCode}
                      onChange={(e) => setTransactionCode(e.target.value)}
                      placeholder="أدخل رمز العملية"
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
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    يجب اختيار عميل محدد للدفع الآجل. سيتم تسجيل المبلغ كدين على العميل.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                إلغاء
              </Button>
              <Button
                className="flex-1 gradient-primary border-0"
                onClick={handleConfirm}
                disabled={!isValid()}
              >
                <Check className="w-4 h-4 me-2" />
                تأكيد الدفع
              </Button>
            </div>
          </div>
        ) : (
          /* Success Screen with Print/Back Options */
          <div className="space-y-6">
            <div className="bg-success/10 rounded-xl p-6 text-center">
              <Check className="w-16 h-16 mx-auto text-success mb-3" />
              <p className="text-xl font-bold text-success mb-2">تمت العملية بنجاح!</p>
              <p className="text-3xl font-bold text-foreground">${total.toFixed(2)}</p>
              {selectedCustomer && (
                <p className="text-sm text-muted-foreground mt-2">
                  العميل: {selectedCustomer.name}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                className="w-full gradient-primary border-0 text-lg"
                onClick={handleBackToPOS}
              >
                العودة إلى نقطة البيع
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full gap-2"
                onClick={handlePrint}
              >
                <Printer className="w-5 h-5" />
                طباعة الفاتورة
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
