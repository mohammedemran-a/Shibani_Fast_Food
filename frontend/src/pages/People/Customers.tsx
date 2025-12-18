import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, UserCircle, Phone, Mail, Eye, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import customerService from '@/api/customerService';

const Customers: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  // Fetch customers from API
  const { data: customersData, isLoading, error } = useQuery({
    queryKey: ['customers', search],
    queryFn: () => customerService.getCustomers({ search }),
  });

  // Delete customer mutation
  const deleteMutation = useMutation({
    mutationFn: customerService.deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete customer');
    },
  });

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const customers = customersData?.data?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading customers</p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['customers'] })}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

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
          <Input 
            placeholder={t('common.search')} 
            className="ps-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {customers.map((customer: any, index: number) => (
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
                    {i18n.language === 'ar' ? customer.name_ar || customer.name : customer.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {customer.total_purchases || 0} {t('people.visits')}
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
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                        {t('common.warning')}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this customer?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDelete(customer.id)} 
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {t('common.confirm')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{customer.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{customer.email || 'N/A'}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">{t('people.totalPurchases')}</p>
              <p className="text-xl font-bold text-success">
                ${customer.total_amount?.toFixed(2) || '0.00'}
              </p>
            </div>
          </motion.div>
        ))}
        {customers.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            {t('common.noData')}
          </div>
        )}
      </div>
    </div>
  );
};

export default Customers;
