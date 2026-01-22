// frontend/src/pages/Debts/CustomerDebtDetails.tsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { debtExpenseService, Invoice } from '@/api/debtExpenseService';
import { 
  ArrowLeft, ArrowRight, User, Phone, DollarSign, FileText, Plus, Check, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const CustomerDebtDetails: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isRTL } = useTheme();
  const queryClient = useQueryClient();
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['customerDebtDetails', id],
    queryFn: () => debtExpenseService.getCustomerDebtDetails(id!),
    enabled: !!id,
  });

  const paymentMutation = useMutation({
    mutationFn: debtExpenseService.payDebt,
    onSuccess: (response) => {
      toast.success(t(response.message_key || 'debts.paymentSuccess'));
      queryClient.invalidateQueries({ queryKey: ['customerDebtDetails', id] });
      queryClient.invalidateQueries({ queryKey: ['debtsSummary'] });
      setIsPaymentModalOpen(false);
    },
    onError: (error: any) => {
      const messageKey = error.response?.data?.message_key || 'common.errorOccurred';
      toast.error(t(messageKey));
    }
  });

  const customer = data?.customer;
  const invoices = data?.invoices || [];
  const payments = data?.payments || [];
  const totalDebt = data?.summary.total_debt || 0;
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const handleOpenPaymentModal = (invoice?: Invoice) => {
    setSelectedInvoice(invoice || null);
    setPaymentAmount(invoice ? invoice.remaining_amount.toString() : '');
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error(t('debts.invalidAmount'));
      return;
    }

    if (selectedInvoice && amount > selectedInvoice.remaining_amount) {
      toast.error(t('debts.amountExceedsDebt'));
      return;
    }

    paymentMutation.mutate({
      customer_id: id!,
      debt_id: selectedInvoice?.debt_id,
      amount,
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4"><Skeleton className="h-10 w-10" /><Skeleton className="h-10 w-1/2" /></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4"><Skeleton className="lg:col-span-2 h-48" /><Skeleton className="h-48" /></div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !customer) {
    return <div className="text-center py-10 text-red-500">{t('common.errorLoadingData')}</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/debts')}><BackIcon className="w-4 h-4" /></Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('debts.customerDetails')}</h1>
          <p className="text-muted-foreground">{t('debts.manageCustomerDebt')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-primary" />{t('debts.customerInfo')}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-muted-foreground">{t('debts.customerName')}</p><p className="font-medium">{customer.name}</p></div>
              <div><p className="text-sm text-muted-foreground">{t('debts.phone')}</p><p className="font-medium">{customer.phone}</p></div>
              <div><p className="text-sm text-muted-foreground">{t('debts.email')}</p><p className="font-medium">{customer.email || t('common.notAvailable')}</p></div>
              <div><p className="text-sm text-muted-foreground">{t('debts.address')}</p><p className="font-medium">{customer.address || t('common.notAvailable')}</p></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20">
          <CardContent className="p-6 flex flex-col items-center justify-center h-full">
            <DollarSign className="w-12 h-12 text-red-500 mb-2" />
            <p className="text-sm text-muted-foreground">{t('debts.remainingDebt')}</p>
            <p className="text-3xl font-bold text-red-500">${totalDebt.toFixed(2)}</p>
            <Button className="mt-4 w-full gradient-primary border-0" onClick={() => handleOpenPaymentModal()}><Plus className="w-4 h-4 me-2" />{t('debts.collectPayment')}</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-primary" />{t('debts.unpaidInvoices')}</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader><TableRow className="bg-muted/50"><TableHead>{t('debts.invoiceNumber')}</TableHead><TableHead>{t('debts.date')}</TableHead><TableHead>{t('debts.invoiceAmount')}</TableHead><TableHead>{t('debts.paidAmount')}</TableHead><TableHead>{t('debts.remainingAmount')}</TableHead><TableHead className="text-center">{t('common.actions')}</TableHead></TableRow></TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>{invoice.sale_date}</TableCell>
                    <TableCell>${invoice.total_amount.toFixed(2)}</TableCell>
                    <TableCell className="text-green-500">${invoice.paid_amount.toFixed(2)}</TableCell>
                    <TableCell className="text-red-500 font-semibold">${invoice.remaining_amount.toFixed(2)}</TableCell>
                    <TableCell><div className="flex items-center justify-center"><Button variant="outline" size="sm" onClick={() => handleOpenPaymentModal(invoice)}><DollarSign className="w-4 h-4 me-1" />{t('debts.pay')}</Button></div></TableCell>
                  </TableRow>
                ))}
                {invoices.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{t('debts.noUnpaidInvoices')}</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-primary" />{t('debts.paymentHistory')}</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader><TableRow className="bg-muted/50"><TableHead>{t('debts.date')}</TableHead><TableHead>{t('debts.amount')}</TableHead><TableHead>{t('debts.forInvoice')}</TableHead></TableRow></TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-muted/30">
                    <TableCell>{payment.payment_date}</TableCell>
                    <TableCell className="text-green-500 font-semibold">+${payment.amount.toFixed(2)}</TableCell>
                    <TableCell>{payment.invoice_number || t('debts.generalPayment')}</TableCell>
                  </TableRow>
                ))}
                {payments.length === 0 && <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">{t('debts.noPayments')}</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{t('debts.recordPayment')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {selectedInvoice && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">{t('debts.payingFor')}</p>
                <p className="font-medium">{selectedInvoice.invoice_number}</p>
                <p className="text-sm text-red-500">{t('debts.remaining')}: ${selectedInvoice.remaining_amount.toFixed(2)}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="paymentAmount">{t('debts.paymentAmount')}</Label>
              <Input id="paymentAmount" type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="0.00" min="0" step="0.01" />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setIsPaymentModalOpen(false)} disabled={paymentMutation.isPending}>{t('common.cancel')}</Button>
              <Button className="flex-1 gradient-primary border-0" onClick={handleConfirmPayment} disabled={paymentMutation.isPending}>
                {paymentMutation.isPending ? <Loader2 className="w-4 h-4 me-2 animate-spin" /> : <Check className="w-4 h-4 me-2" />}
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
