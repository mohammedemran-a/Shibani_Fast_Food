import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight,
  User, 
  Phone, 
  DollarSign,
  FileText,
  Plus,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
}

interface Payment {
  id: string;
  date: string;
  amount: number;
  invoiceNumber: string;
}

// Mock data
const mockCustomer = {
  id: '1',
  name: 'أحمد محمد',
  phone: '0501234567',
  email: 'ahmed@example.com',
  address: 'الرياض، حي النخيل',
  totalDebt: 1500,
};

const mockInvoices: Invoice[] = [
  { id: '1', invoiceNumber: 'INV-001', date: '2024-01-15', amount: 500, paidAmount: 0, remainingAmount: 500 },
  { id: '2', invoiceNumber: 'INV-002', date: '2024-01-12', amount: 600, paidAmount: 100, remainingAmount: 500 },
  { id: '3', invoiceNumber: 'INV-003', date: '2024-01-10', amount: 700, paidAmount: 200, remainingAmount: 500 },
];

const mockPayments: Payment[] = [
  { id: '1', date: '2024-01-14', amount: 100, invoiceNumber: 'INV-002' },
  { id: '2', date: '2024-01-11', amount: 200, invoiceNumber: 'INV-003' },
];

const CustomerDebtDetails: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { isRTL } = useTheme();
  
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const totalDebt = invoices.reduce((sum, inv) => sum + inv.remainingAmount, 0);
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const handleOpenPaymentModal = (invoice?: Invoice) => {
    setSelectedInvoice(invoice || null);
    setPaymentAmount('');
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error(t('debts.invalidAmount'));
      return;
    }

    if (selectedInvoice) {
      // Pay specific invoice
      if (amount > selectedInvoice.remainingAmount) {
        toast.error(t('debts.amountExceedsDebt'));
        return;
      }

      setInvoices(prev => prev.map(inv => 
        inv.id === selectedInvoice.id
          ? { ...inv, paidAmount: inv.paidAmount + amount, remainingAmount: inv.remainingAmount - amount }
          : inv
      ));

      setPayments(prev => [...prev, {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        amount,
        invoiceNumber: selectedInvoice.invoiceNumber,
      }]);
    } else {
      // General payment - distribute across invoices
      let remainingPayment = amount;
      const updatedInvoices = invoices.map(inv => {
        if (remainingPayment <= 0 || inv.remainingAmount <= 0) return inv;
        
        const payForThis = Math.min(remainingPayment, inv.remainingAmount);
        remainingPayment -= payForThis;
        
        return {
          ...inv,
          paidAmount: inv.paidAmount + payForThis,
          remainingAmount: inv.remainingAmount - payForThis,
        };
      });
      
      setInvoices(updatedInvoices);
      setPayments(prev => [...prev, {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        amount,
        invoiceNumber: 'دفعة عامة',
      }]);
    }

    toast.success(t('debts.paymentSuccess'));
    setIsPaymentModalOpen(false);
    setPaymentAmount('');
    setSelectedInvoice(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/debts')}>
          <BackIcon className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('debts.customerDetails')}</h1>
          <p className="text-muted-foreground">{t('debts.manageCustomerDebt')}</p>
        </div>
      </div>

      {/* Customer Info & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              {t('debts.customerInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('debts.customerName')}</p>
                <p className="font-medium">{mockCustomer.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('debts.phone')}</p>
                <p className="font-medium">{mockCustomer.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('debts.email')}</p>
                <p className="font-medium">{mockCustomer.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('debts.address')}</p>
                <p className="font-medium">{mockCustomer.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20">
          <CardContent className="p-6 flex flex-col items-center justify-center h-full">
            <DollarSign className="w-12 h-12 text-red-500 mb-2" />
            <p className="text-sm text-muted-foreground">{t('debts.remainingDebt')}</p>
            <p className="text-3xl font-bold text-red-500">${totalDebt.toFixed(2)}</p>
            <Button
              className="mt-4 w-full gradient-primary border-0"
              onClick={() => handleOpenPaymentModal()}
            >
              <Plus className="w-4 h-4 me-2" />
              {t('debts.collectPayment')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Unpaid Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            {t('debts.unpaidInvoices')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>{t('debts.invoiceNumber')}</TableHead>
                  <TableHead>{t('debts.date')}</TableHead>
                  <TableHead>{t('debts.invoiceAmount')}</TableHead>
                  <TableHead>{t('debts.paidAmount')}</TableHead>
                  <TableHead>{t('debts.remainingAmount')}</TableHead>
                  <TableHead className="text-center">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.filter(inv => inv.remainingAmount > 0).map((invoice) => (
                  <TableRow key={invoice.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-green-500">${invoice.paidAmount.toFixed(2)}</TableCell>
                    <TableCell className="text-red-500 font-semibold">
                      ${invoice.remainingAmount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenPaymentModal(invoice)}
                        >
                          <DollarSign className="w-4 h-4 me-1" />
                          {t('debts.pay')}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {invoices.filter(inv => inv.remainingAmount > 0).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {t('debts.noUnpaidInvoices')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            {t('debts.paymentHistory')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>{t('debts.date')}</TableHead>
                  <TableHead>{t('debts.amount')}</TableHead>
                  <TableHead>{t('debts.forInvoice')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-muted/30">
                    <TableCell>{payment.date}</TableCell>
                    <TableCell className="text-green-500 font-semibold">
                      +${payment.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>{payment.invoiceNumber}</TableCell>
                  </TableRow>
                ))}
                {payments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      {t('debts.noPayments')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('debts.recordPayment')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedInvoice && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">{t('debts.payingFor')}</p>
                <p className="font-medium">{selectedInvoice.invoiceNumber}</p>
                <p className="text-sm text-red-500">
                  {t('debts.remaining')}: ${selectedInvoice.remainingAmount.toFixed(2)}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label>{t('debts.paymentAmount')}</Label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setIsPaymentModalOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button className="flex-1 gradient-primary border-0" onClick={handleConfirmPayment}>
                <Check className="w-4 h-4 me-2" />
                {t('debts.confirmPayment')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerDebtDetails;
