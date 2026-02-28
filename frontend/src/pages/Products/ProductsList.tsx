import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Edit2, Trash2, Eye, AlertTriangle, Package, PackageCheck, PackageX } from 'lucide-react';
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
// ✅ استيراد الـ hook الجديد
import { useProducts, useDeleteProduct, useUpdateProductStatus } from '@/hooks/useProducts';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Product } from '@/api/productService';

const ProductsList: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: productsData, isLoading, error } = useProducts({ 
    search,
    with: 'stockBatches,barcodes,category,brand' 
  });

  const deleteMutation = useDeleteProduct();
  // ✅ استخدام الـ hook الجديد والمخصص
  const updateStatusMutation = useUpdateProductStatus();

  // الدوال المساعدة (لا تغيير هنا)
  const getTotalStock = (product: Product): number => {
    if (!product.stock_batches) return 0;
    return product.stock_batches.reduce((total, batch) => total + Number(batch.quantity_remaining), 0);
  };

  const getBaseSellingPrice = (product: Product): number => {
    const baseUnit = product.barcodes?.find(b => b.is_base_unit);
    return baseUnit ? Number(baseUnit.selling_price) : 0;
  };

  const getLastCostPrice = (product: Product): number => {
    if (!product.stock_batches || product.stock_batches.length === 0) return 0;
    const lastBatch = product.stock_batches[product.stock_batches.length - 1];
    return Number(lastBatch.purchase_price_per_unit);
  };

  const getStatusBadge = (product: Product) => {
    const totalStock = getTotalStock(product);
    
    let label = t('products.available');
    let styleClass = 'bg-success/10 text-success';
    let Icon = PackageCheck;

    if (totalStock === 0) {
      label = t('products.outOfStock');
      styleClass = 'bg-destructive/10 text-destructive';
      Icon = PackageX;
    } else if (product.reorder_level && totalStock <= product.reorder_level) {
      label = t('products.lowStock');
      styleClass = 'bg-warning/10 text-warning';
      Icon = AlertTriangle;
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${styleClass}`}>
        <Icon className="h-3 w-3" />
        {label}
      </span>
    );
  };

  const handleDeleteSingle = (id: number) => {
    deleteMutation.mutate(id);
  };

  /**
   * ✅ ===================================================================
   * ✅ الحل: استخدام الـ hook الجديد والمخصص
   * ✅ ===================================================================
   */
  const handleToggleActive = (product: Product) => {
    const newStatus = !product.is_active;
    
    // استدعاء الـ mutation الجديدة
    updateStatusMutation.mutate({ id: product.id, isActive: newStatus }, {
      onSuccess: () => {
        toast.success(newStatus ? 'تم تفعيل المنتج' : 'تم إلغاء تفعيل المنتج');
      },
      onError: () => {
        toast.error('فشل في تحديث حالة المنتج');
      }
    });
  };

  const products: Product[] = productsData?.data?.data || [];

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
      {/* Header (لا تغيير هنا) */}
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

      {/* Filters (لا تغيير هنا) */}
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

      {/* Table (مُحدَّث بالكامل) */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-start py-3 px-4 font-medium text-muted-foreground">{t('products.name')}</th>
                <th className="text-start py-3 px-4 font-medium text-muted-foreground">{t('products.sku')}</th>
                <th className="text-start py-3 px-4 font-medium text-muted-foreground">{t('products.category')}</th>
                <th className="text-start py-3 px-4 font-medium text-muted-foreground">آخر تكلفة</th>
                <th className="text-start py-3 px-4 font-medium text-muted-foreground">سعر البيع (أساسي)</th>
                <th className="text-start py-3 px-4 font-medium text-muted-foreground">المخزون</th>
                <th className="text-start py-3 px-4 font-medium text-muted-foreground">{t('common.status')}</th>
                <th className="text-end py-3 px-4 font-medium text-muted-foreground">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-t border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img 
                          src={product.image_url || '/no-image.svg'} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/no-image.svg'; }}
                        />
                      </div>
                      <span className="font-medium text-foreground">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{product.sku}</td>
                  <td className="py-3 px-4 text-muted-foreground">{product.category?.name || '-'}</td>
                  <td className="py-3 px-4 text-muted-foreground">${getLastCostPrice(product).toFixed(2)}</td>
                  <td className="py-3 px-4 font-semibold text-primary">${getBaseSellingPrice(product).toFixed(2)}</td>
                  <td className="py-3 px-4 font-semibold">{getTotalStock(product)}</td>
                  <td className="py-3 px-4">{getStatusBadge(product)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleToggleActive(product)}
                        disabled={updateStatusMutation.isPending} // ✅ استخدام الحالة الصحيحة
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
                            disabled={deleteMutation.isPending}
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
                              {t('common.deleteUserWarning')}
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
                  <td colSpan={8} className="py-16 text-center text-muted-foreground">
                    <Package className="mx-auto h-12 w-12 opacity-50" />
                    <p className="mt-4">{t('common.noData')}</p>
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
