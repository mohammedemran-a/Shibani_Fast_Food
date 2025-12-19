import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Edit2, Trash2, Eye, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
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
import { useProducts, useDeleteProduct } from '@/hooks/useProducts';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const ProductsList: React.FC = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  // Fetch products with caching (5 minutes)
  const { data: productsData, isLoading, error } = useProducts({ search });

  // Delete product mutation
  const deleteMutation = useDeleteProduct();

  const getStatusBadge = (quantity: number) => {
    let status = 'active';
    let label = t('products.available');
    let styleClass = 'bg-success/10 text-success';

    if (quantity === 0) {
      status = 'out';
      label = t('products.outOfStock');
      styleClass = 'bg-destructive/10 text-destructive';
    } else if (quantity < 10) {
      status = 'low';
      label = t('products.lowStock');
      styleClass = 'bg-warning/10 text-warning';
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styleClass}`}>
        {label}
      </span>
    );
  };

  const handleDeleteSingle = (id: number) => {
    deleteMutation.mutate(id);
  };

  const products = productsData?.data?.data || [];

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
          <p className="text-destructive mb-4">Error loading products</p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['products'] })}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('products.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('products.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/products/import">
            <Button variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              {t('products.import')}
            </Button>
          </Link>
          <Link to="/products/add">
            <Button className="gradient-primary border-0 gap-2">
              <Plus className="w-4 h-4" />
              {t('products.addProduct')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder={t('common.search')} 
              className="ps-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            {t('products.filter')}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('products.name')}</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('products.sku')}</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('products.category')}</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('products.purchasePrice')}</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('products.salePrice')}</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('products.quantity')}</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('common.status')}</th>
                <th className="text-start py-4 px-4 font-medium text-muted-foreground">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product: any, index: number) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-t border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img 
                          src={product.image_url || '/no-image.svg'} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/no-image.svg';
                          }}
                        />
                      </div>
                      <span className="font-medium text-foreground">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-muted-foreground">{product.sku}</td>
                  <td className="py-4 px-4 text-muted-foreground">{product.category?.name || '-'}</td>
                  <td className="py-4 px-4 text-muted-foreground">${Number(product.purchase_price || 0).toFixed(2)}</td>
                  <td className="py-4 px-4 font-semibold text-primary">${Number(product.selling_price || 0).toFixed(2)}</td>
                  <td className="py-4 px-4 text-muted-foreground">{product.quantity}</td>
                  <td className="py-4 px-4">{getStatusBadge(product.quantity)}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => {
                          // Toggle is_active
                          const newStatus = !product.is_active;
                          const token = localStorage.getItem('auth_token');
                          fetch(`http://localhost:8000/api/products/${product.id}`, {
                            method: 'PUT',
                            headers: { 
                              'Content-Type': 'application/json',
                              'Accept': 'application/json',
                              'Authorization': `Bearer ${token}`,
                            },
                            body: JSON.stringify({ is_active: newStatus })
                          })
                          .then(res => {
                            if (!res.ok) throw new Error('Failed to update');
                            return res.json();
                          })
                          .then(() => {
                            toast.success(newStatus ? 'تم تفعيل المنتج' : 'تم إلغاء تفعيل المنتج');
                            queryClient.invalidateQueries({ queryKey: ['products'] });
                          })
                          .catch(err => {
                            toast.error('فشل في تحديث حالة المنتج');
                            console.error(err);
                          });
                        }}
                      >
                        <Eye className={`w-4 h-4 ${product.is_active ? 'text-success' : 'text-muted-foreground'}`} />
                      </Button>
                      <Link to={`/products/edit/${product.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
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
                              Are you sure you want to delete this product?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteSingle(product.id)} 
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {t('common.confirm')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    {t('common.noData')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductsList;
