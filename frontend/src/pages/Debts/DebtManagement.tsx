import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  User, 
  Eye, 
  DollarSign,
  TrendingDown,
  Users,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CustomerDebt {
  id: string;
  customerName: string;
  phone: string;
  totalDebt: number;
  unpaidInvoices: number;
  lastPurchase: string;
}

const mockCustomerDebts: CustomerDebt[] = [
  { id: '1', customerName: 'أحمد محمد', phone: '0501234567', totalDebt: 1500, unpaidInvoices: 3, lastPurchase: '2024-01-15' },
  { id: '2', customerName: 'خالد العبدالله', phone: '0559876543', totalDebt: 850, unpaidInvoices: 2, lastPurchase: '2024-01-14' },
  { id: '3', customerName: 'سعد السعود', phone: '0561112233', totalDebt: 2200, unpaidInvoices: 5, lastPurchase: '2024-01-13' },
  { id: '4', customerName: 'فهد الفهد', phone: '0544455566', totalDebt: 450, unpaidInvoices: 1, lastPurchase: '2024-01-12' },
];

const DebtManagement: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDebts = mockCustomerDebts.filter(debt =>
    debt.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    debt.phone.includes(searchQuery)
  );

  const totalDebts = mockCustomerDebts.reduce((sum, debt) => sum + debt.totalDebt, 0);
  const totalCustomers = mockCustomerDebts.length;
  const totalInvoices = mockCustomerDebts.reduce((sum, debt) => sum + debt.unpaidInvoices, 0);

  const stats = [
    {
      title: t('debts.totalDebts'),
      value: `$${totalDebts.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      title: t('debts.debtorsCount'),
      value: totalCustomers.toString(),
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: t('debts.unpaidInvoices'),
      value: totalInvoices.toString(),
      icon: TrendingDown,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('debts.title')}</h1>
          <p className="text-muted-foreground">{t('debts.subtitle')}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              {t('debts.customersList')}
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('debts.searchCustomer')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>{t('debts.customerName')}</TableHead>
                  <TableHead>{t('debts.phone')}</TableHead>
                  <TableHead>{t('debts.totalDebt')}</TableHead>
                  <TableHead>{t('debts.unpaidInvoices')}</TableHead>
                  <TableHead>{t('debts.lastPurchase')}</TableHead>
                  <TableHead className="text-center">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDebts.map((debt) => (
                  <TableRow key={debt.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium">{debt.customerName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{debt.phone}</TableCell>
                    <TableCell>
                      <span className="text-red-500 font-semibold">
                        ${debt.totalDebt.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full bg-orange-500/10 text-orange-500 text-sm">
                        {debt.unpaidInvoices} {t('debts.invoices')}
                      </span>
                    </TableCell>
                    <TableCell>{debt.lastPurchase}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/debts/${debt.id}`)}
                        >
                          <Eye className="w-4 h-4 me-1" />
                          {t('debts.viewDetails')}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredDebts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {t('common.noData')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DebtManagement;
