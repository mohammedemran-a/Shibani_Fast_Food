import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, ArrowRight, User, Phone, Mail, MapPin, 
  FileText, Heart, CreditCard, Gift, Calendar, Package,
  TrendingUp, DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';

// Mock customer data
const customerData = {
  id: 1,
  name: 'أحمد محمد',
  nameEn: 'Ahmed Mohammed',
  phone: '+966501234567',
  email: 'ahmed@email.com',
  address: 'الرياض، المملكة العربية السعودية',
  addressEn: 'Riyadh, Saudi Arabia',
  totalPurchases: 12500.00,
  visits: 45,
  loyaltyPoints: 1250,
  joinDate: '2024-01-15',
};

const invoices = [
  { id: 'INV-001', date: '2024-12-15', total: 250.00, items: 5, status: 'completed' },
  { id: 'INV-002', date: '2024-12-10', total: 180.50, items: 3, status: 'completed' },
  { id: 'INV-003', date: '2024-12-05', total: 320.00, items: 8, status: 'completed' },
  { id: 'INV-004', date: '2024-11-28', total: 95.00, items: 2, status: 'completed' },
  { id: 'INV-005', date: '2024-11-20', total: 450.00, items: 10, status: 'completed' },
];

const favoriteProducts = [
  { id: 1, name: 'قهوة عربية', nameEn: 'Arabic Coffee', purchaseCount: 15, totalSpent: 45.00, image: '☕' },
  { id: 2, name: 'حليب طازج', nameEn: 'Fresh Milk', purchaseCount: 12, totalSpent: 30.00, image: '🥛' },
  { id: 3, name: 'خبز', nameEn: 'Bread', purchaseCount: 10, totalSpent: 10.00, image: '🍞' },
  { id: 4, name: 'جبنة', nameEn: 'Cheese', purchaseCount: 8, totalSpent: 32.00, image: '🧀' },
];

const debtHistory = [
  { id: 1, invoiceId: 'INV-006', date: '2024-12-18', amount: 500.00, paid: 200.00, remaining: 300.00 },
  { id: 2, invoiceId: 'INV-007', date: '2024-12-12', amount: 350.00, paid: 350.00, remaining: 0 },
];

const loyaltyHistory = [
  { id: 1, date: '2024-12-15', type: 'earned', points: 25, description: 'مشتريات فاتورة INV-001' },
  { id: 2, date: '2024-12-10', type: 'earned', points: 18, description: 'مشتريات فاتورة INV-002' },
  { id: 3, date: '2024-12-05', type: 'redeemed', points: -50, description: 'استبدال نقاط' },
  { id: 4, date: '2024-12-01', type: 'earned', points: 32, description: 'مشتريات فاتورة INV-003' },
];

const CustomerDetails: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { isRTL } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('info');

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

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
              <h2 className="text-2xl font-bold">
                {i18n.language === 'ar' ? customerData.name : customerData.nameEn}
              </h2>
              <p className="opacity-90">{t('customers.memberSince')}: {customerData.joinDate}</p>
            </div>
            <div className="text-end text-primary-foreground">
              <div className="text-3xl font-bold">{customerData.loyaltyPoints}</div>
              <div className="text-sm opacity-90">{t('customers.loyaltyPoints')}</div>
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <DollarSign className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold text-foreground">${customerData.totalPurchases.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">{t('customers.totalPurchases')}</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <Package className="w-6 h-6 mx-auto mb-2 text-success" />
              <div className="text-2xl font-bold text-foreground">{customerData.visits}</div>
              <div className="text-sm text-muted-foreground">{t('customers.visits')}</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-warning" />
              <div className="text-2xl font-bold text-foreground">${(customerData.totalPurchases / customerData.visits).toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">{t('customers.avgPurchase')}</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <Gift className="w-6 h-6 mx-auto mb-2 text-accent" />
              <div className="text-2xl font-bold text-foreground">{customerData.loyaltyPoints}</div>
              <div className="text-sm text-muted-foreground">{t('customers.points')}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-5 h-auto p-1">
          <TabsTrigger value="info" className="gap-2 py-3">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">{t('customers.basicInfo')}</span>
          </TabsTrigger>
          <TabsTrigger value="invoices" className="gap-2 py-3">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">{t('customers.invoices')}</span>
          </TabsTrigger>
          <TabsTrigger value="favorites" className="gap-2 py-3">
            <Heart className="w-4 h-4" />
            <span className="hidden sm:inline">{t('customers.favorites')}</span>
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
                    <p className="font-medium text-foreground">{customerData.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t('customers.email')}</p>
                    <p className="font-medium text-foreground">{customerData.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 md:col-span-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t('customers.address')}</p>
                    <p className="font-medium text-foreground">
                      {i18n.language === 'ar' ? customerData.address : customerData.addressEn}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t('customers.memberSince')}</p>
                    <p className="font-medium text-foreground">{customerData.joinDate}</p>
                  </div>
                </div>
              </div>
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
              <div className="space-y-3">
                {invoices.map((invoice, index) => (
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
                        <p className="font-medium text-foreground">{invoice.id}</p>
                        <p className="text-sm text-muted-foreground">{invoice.date}</p>
                      </div>
                    </div>
                    <div className="text-end">
                      <p className="font-bold text-primary">${invoice.total.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">{invoice.items} {t('customers.items')}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Favorites Tab */}
        <TabsContent value="favorites" className="mt-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>{t('customers.favoriteProducts')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favoriteProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-muted/50"
                  >
                    <div className="text-4xl">{product.image}</div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {i18n.language === 'ar' ? product.name : product.nameEn}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t('customers.purchased')} {product.purchaseCount} {t('customers.times')}
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="font-bold text-primary">${product.totalSpent.toFixed(2)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Debts Tab */}
        <TabsContent value="debts" className="mt-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>{t('customers.debtHistory')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {debtHistory.map((debt, index) => (
                  <motion.div
                    key={debt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/50"
                  >
                    <div>
                      <p className="font-medium text-foreground">{debt.invoiceId}</p>
                      <p className="text-sm text-muted-foreground">{debt.date}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">{t('customers.totalAmount')}</p>
                      <p className="font-medium text-foreground">${debt.amount.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">{t('customers.paid')}</p>
                      <p className="font-medium text-success">${debt.paid.toFixed(2)}</p>
                    </div>
                    <div className="text-end">
                      <p className="text-sm text-muted-foreground">{t('customers.remaining')}</p>
                      <p className={`font-bold ${debt.remaining > 0 ? 'text-destructive' : 'text-success'}`}>
                        ${debt.remaining.toFixed(2)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Loyalty Tab */}
        <TabsContent value="loyalty" className="mt-6">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('customers.loyaltyHistory')}</CardTitle>
              <Badge className="bg-primary/10 text-primary text-lg px-4 py-1">
                {customerData.loyaltyPoints} {t('customers.points')}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loyaltyHistory.map((record, index) => (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        record.type === 'earned' ? 'bg-success/10' : 'bg-warning/10'
                      }`}>
                        <Gift className={`w-5 h-5 ${
                          record.type === 'earned' ? 'text-success' : 'text-warning'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{record.description}</p>
                        <p className="text-sm text-muted-foreground">{record.date}</p>
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${
                      record.points > 0 ? 'text-success' : 'text-warning'
                    }`}>
                      {record.points > 0 ? '+' : ''}{record.points}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerDetails;
