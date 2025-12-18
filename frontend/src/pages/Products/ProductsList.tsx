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
import { toast } from 'sonner';

const initialProducts = [
  { id: 1, name: 'قهوة عربية', sku: 'PRD-001', category: 'مشروبات', brand: 'الشرق', purchasePrice: 2.00, salePrice: 3.00, quantity: 50, status: 'active' },
  { id: 2, name: 'شاي أخضر', sku: 'PRD-002', category: 'مشروبات', brand: 'ليبتون', purchasePrice: 1.50, salePrice: 2.00, quantity: 80, status: 'active' },
  { id: 3, name: 'عصير برتقال', sku: 'PRD-003', category: 'مشروبات', brand: 'ندى', purchasePrice: 2.50, salePrice: 3.50, quantity: 30, status: 'active' },
  { id: 4, name: 'بسكويت شوكولاتة', sku: 'PRD-004', category: 'وجبات خفيفة', brand: 'أوريو', purchasePrice: 1.50, salePrice: 2.00, quantity: 5, status: 'low' },
  { id: 5, name: 'حليب طازج', sku: 'PRD-005', category: 'منتجات ألبان', brand: 'المراعي', purchasePrice: 2.00, salePrice: 2.50, quantity: 0, status: 'out' },
];

const ProductsList: React.FC = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState(initialProducts);

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-success/10 text-success',
      low: 'bg-warning/10 text-warning',
      out: 'bg-destructive/10 text-destructive',
    };
    const labels = {
      active: t('products.available'),
      low: t('products.lowStock'),
      out: t('products.outOfStock'),
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const handleDeleteAll = () => {
    setProducts([]);
    toast.success(t('products.deleteAllSuccess'));
  };

  const handleDeleteSingle = (id: number) => {
    setProducts(products.filter(p => p.id !== id));
    toast.success(t('products.deleteProduct'));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('products.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('products.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2" disabled={products.length === 0}>
                <Trash2 className="w-4 h-4" />
                {t('products.deleteAll')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  {t('common.warning')}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t('products.deleteAllConfirm')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {t('common.confirm')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
            <Input placeholder={t('common.search')} className="ps-10" />
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
              {products.map((product, index) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-t border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="py-4 px-4 font-medium text-foreground">{product.name}</td>
                  <td className="py-4 px-4 text-muted-foreground">{product.sku}</td>
                  <td className="py-4 px-4 text-muted-foreground">{product.category}</td>
                  <td className="py-4 px-4 text-muted-foreground">${product.purchasePrice.toFixed(2)}</td>
                  <td className="py-4 px-4 font-semibold text-primary">${product.salePrice.toFixed(2)}</td>
                  <td className="py-4 px-4 text-muted-foreground">{product.quantity}</td>
                  <td className="py-4 px-4">{getStatusBadge(product.status)}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteSingle(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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