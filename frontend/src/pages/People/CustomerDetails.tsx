import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, ArrowRight, User, Phone, Mail, MapPin, 
  FileText, Heart, CreditCard, Gift, Calendar, Package,
  TrendingUp, DollarSign, Loader2, ServerCrash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
import { customerService } from '@/api/customerService';
import PageErrorBoundary from '@/components/PageErrorBoundary';

const CustomerDetailsContent: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { isRTL } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('info');

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  // 1. جلب بيانات العميل الكاملة من الواجهة الخلفية. هذا الاستعلام يجلب حقل `loyalty_points` تلقائيًا.
  const { data: customerResponse, isLoading, error } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customerService.getCustomer(Number(id)),
    enabled: !!id,
  });

  const customer = customerResponse?.data;
  const salesInvoices = customer?.sales_invoices || [];
  const debts = customer?.debts || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <ServerCrash className="w-16 h-16 text-destructive" />
        <p className="text-destructive">فشل تحميل بيانات العميل</p>
        <Button onClick={() => navigate('/people/customers')}>
          العودة للقائمة
        </Button>
      </div>
    );
  }

  const totalPurchases = Number(customer.sales_invoices_sum_total_amount || 0);
  const visits = customer.sales_invoices_count || 0;
  const avgPurchase = visits > 0 ? totalPurchases / visits : 0;
  const totalDebts = Number(customer.debts_remaining || customer.debts_sum_remaining_amount || 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/people/customers')}>
          <BackIcon className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {t('customers.customerProfile')}
          </h1>
          <p className="text-muted-foreground">{t('customers.view360')}</p>
        </div>
      </div>

      {/* Customer Summary Card */}
      <Card className="glass-card overflow-hidden">
        <div className="gradient-primary p-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-background/20 flex items-center justify-center">
              <User className="w-10 h-10 text-primary-foreground" />
            </div>
            <div className="flex-1 text-primary-foreground">
              <h2 className="text-2xl font-bold">{customer.name}</h2>
              <p className="opacity-90">
                {t('customers.memberSince')}: {new Date(customer.created_at).toLocaleDateString('ar-SA')}
              </p>
            </div>
            {/* 2. الربط الأول: عرض نقاط الولاء في بطاقة الملخص العلوية */}
            <div className="text-end text-primary-foreground">
              <div className="text-3xl font-bold">
                {/* استخدام القيمة الحقيقية من `customer.loyalty_points` مع التأكد من أنها رقم صحيح */}
                {Math.floor(Number(customer.loyalty_points)) || 0}
              </div>
              <div className="text-sm opacity-90">{t('customers.loyaltyPoints')}</div>
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <DollarSign className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold text-foreground">${totalPurchases.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">{t('customers.totalPurchases')}</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <Package className="w-6 h-6 mx-auto mb-2 text-success" />
              <div className="text-2xl font-bold text-foreground">{visits}</div>
              <div className="text-sm text-muted-foreground">{t('customers.visits')}</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-warning" />
              <div className="text-2xl font-bold text-foreground">${avgPurchase.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">{t('customers.avgPurchase')}</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <CreditCard className="w-6 h-6 mx-auto mb-2 text-destructive" />
              <div className="text-2xl font-bold text-foreground">${totalDebts.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">الديون المتبقية</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-4 h-auto p-1">
          <TabsTrigger value="info" className="gap-2 py-3">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">{t('customers.basicInfo')}</span>
          </TabsTrigger>
          <TabsTrigger value="invoices" className="gap-2 py-3">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">{t('customers.invoices')}</span>
          </TabsTrigger>
          <TabsTrigger value="debts" className="gap-2 py-3">
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">{t('customers.debts')}</span>
          </TabsTrigger>
          <TabsTrigger value="loyalty" className="gap-2 py-3">
            <Gift className="w-4 h-4" />
            <span className="hidden sm:inline">{t('customers.loyalty')}</span>
          </TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="info" className="mt-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>{t('customers.basicInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t('customers.phone')}</p>
                    <p className="font-medium text-foreground">{customer.phone || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t('customers.email')}</p>
                    <p className="font-medium text-foreground">{customer.email || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 md:col-span-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t('customers.address')}</p>
                    <p className="font-medium text-foreground">
                      {customer.address || 'N/A'} {customer.city && `, ${customer.city}`} {customer.country && `, ${customer.country}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t('customers.memberSince')}</p>
                    <p className="font-medium text-foreground">
                      {new Date(customer.created_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                  <div className={`w-3 h-3 rounded-full ${customer.is_active ? 'bg-success' : 'bg-destructive'}`} />
                  <div>
                    <p className="text-sm text-muted-foreground">الحالة</p>
                    <p className="font-medium text-foreground">
                      {customer.is_active ? 'نشط' : 'غير نشط'}
                    </p>
                  </div>
                </div>
              </div>
              {customer.notes && (
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">ملاحظات</p>
                  <p className="text-foreground">{customer.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="mt-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>{t('customers.invoiceHistory')}</CardTitle>
            </CardHeader>
            <CardContent>
              {salesInvoices.length > 0 ? (
                <div className="space-y-3">
                  {salesInvoices.map((invoice: any, index: number) => (
                    <motion.div
                      key={invoice.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{invoice.invoice_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(invoice.invoice_date).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                      </div>
                      <div className="text-end">
                        <p className="font-bold text-primary">${Number(invoice.total_amount).toFixed(2)}</p>
                        <Badge variant={invoice.status === 'completed' ? 'default' : 'secondary'}>
                          {invoice.status === 'completed' ? 'مكتمل' : invoice.status}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد فواتير لهذا العميل
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Debts Tab */}
        <TabsContent value="debts" className="mt-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>سجل الديون</CardTitle>
            </CardHeader>
            <CardContent>
              {debts.length > 0 ? (
                <div className="space-y-3">
                  {debts.map((debt: any, index: number) => (
                    <motion.div
                      key={debt.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-destructive" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">دين #{debt.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(debt.created_at).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                      </div>
                      <div className="text-end">
                        <p className="font-bold text-destructive">${Number(debt.remaining_amount).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          من ${Number(debt.amount).toFixed(2)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد ديون لهذا العميل
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. الربط الثاني: عرض نقاط الولاء في علامة التبويب المخصصة */}
        <TabsContent value="loyalty" className="mt-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>نقاط الولاء</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Gift className="w-16 h-16 mx-auto mb-4 text-primary" />
                <div className="text-4xl font-bold text-primary mb-2">
                  {/* استخدام القيمة الحقيقية من `customer.loyalty_points` مع التأكد من أنها رقم صحيح */}
                  {Math.floor(Number(customer.loyalty_points)) || 0}
                </div>
                <p className="text-muted-foreground">نقطة متاحة</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// تصدير الصفحة مع حماية ضد الأخطاء
const CustomerDetails: React.FC = () => {
  return (
    <PageErrorBoundary pageName="تفاصيل العميل">
      <CustomerDetailsContent />
    </PageErrorBoundary>
  );
};

export default CustomerDetails;
