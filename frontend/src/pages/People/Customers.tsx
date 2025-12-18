import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, UserCircle, Phone, Mail, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const customers = [
  { id: 1, name: 'أحمد محمد', nameEn: 'Ahmed Mohammed', phone: '+966501234567', email: 'ahmed@email.com', totalPurchases: 1250.00, visits: 15 },
  { id: 2, name: 'سارة علي', nameEn: 'Sara Ali', phone: '+966502345678', email: 'sara@email.com', totalPurchases: 890.50, visits: 8 },
  { id: 3, name: 'محمد خالد', nameEn: 'Mohammed Khaled', phone: '+966503456789', email: 'mohammed@email.com', totalPurchases: 2100.00, visits: 22 },
  { id: 4, name: 'فاطمة أحمد', nameEn: 'Fatima Ahmed', phone: '+966504567890', email: 'fatima@email.com', totalPurchases: 560.00, visits: 5 },
];

const Customers: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('nav.customers')}</h1>
          <p className="text-muted-foreground mt-1">{t('people.customersSubtitle')}</p>
        </div>
        <Button className="gradient-primary border-0 gap-2">
          <Plus className="w-4 h-4" />
          {t('people.addCustomer')}
        </Button>
      </div>

      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={t('common.search')} className="ps-10" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {customers.map((customer, index) => (
          <motion.div
            key={customer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card p-5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                  <UserCircle className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    {i18n.language === 'ar' ? customer.name : customer.nameEn}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {customer.visits} {t('people.visits')}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => navigate(`/people/customers/${customer.id}`)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{customer.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{customer.email}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">{t('people.totalPurchases')}</p>
              <p className="text-xl font-bold text-success">${customer.totalPurchases.toFixed(2)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Customers;
