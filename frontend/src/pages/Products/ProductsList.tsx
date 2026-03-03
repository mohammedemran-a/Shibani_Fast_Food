import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Package, Utensils, Box } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/types'; // استيراد النوع

const ProductsList: React.FC = () => {
  const { t } = useTranslation();
  
  const { 
    products, 
    loading, 
    error, 
    removeProduct, 
    setFilters, 
    filters 
  } = useProducts();

  const handleDelete = (id: number) => {
    toast.promise(removeProduct(id), {
      loading: 'جاري حذف المنتج...',
      success: 'تم حذف المنتج بنجاح!',
      error: 'فشل في حذف المنتج.',
    });
  };

  // ✅ 1. عرض التحميل أولاً وقبل كل شيء
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // ✅ 2. عرض الخطأ ثانيًا
  if (error) {
    return (
      <div className="flex items-center justify-center h-96 text-center text-destructive">
        <p>خطأ في جلب المنتجات: {error}</p>
      </div>
    );
  }

  // ✅ 3. التحقق الصريح من أن `products` هي مصفوفة قبل أي شيء آخر
  // هذا هو التحصين النهائي الذي يمنع الخطأ بشكل قاطع
  const safeProducts: Product[] = Array.isArray(products) ? products : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header and Filters remain the same */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">إدارة المنتجات</h1>
          <p className="text-muted-foreground">إدارة الوجبات والمواد الخام</p>
        </div>
        <Link to="/products/add">
          <Button className="gradient-primary border-0 gap-2">
            <Plus className="w-4 h-4" />
            إضافة منتج
          </Button>
        </Link>
      </div>
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="ابحث بالاسم..." 
              className="ps-10"
              onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <select 
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
            className="bg-input border border-border rounded-md px-3 py-2 text-sm"
          >
            <option value="">كل الأنواع</option>
            <option value="Sellable">وجبات</option>
            <option value="RawMaterial">مواد خام</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-start py-3 px-4 font-medium text-muted-foreground">المنتج</th>
                <th className="text-start py-3 px-4 font-medium text-muted-foreground">النوع</th>
                <th className="text-start py-3 px-4 font-medium text-muted-foreground">الفئة</th>
                <th className="text-start py-3 px-4 font-medium text-muted-foreground">السعر / التكلفة</th>
                <th className="text-start py-3 px-4 font-medium text-muted-foreground">المخزون الحالي</th>
                <th className="text-start py-3 px-4 font-medium text-muted-foreground">الحالة</th>
                <th className="text-end py-3 px-4 font-medium text-muted-foreground">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {/* ✅ 4. استخدام المتغير الآمن `safeProducts` */}
              {safeProducts.length > 0 ? (
                safeProducts.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-t border-border hover:bg-muted/30 transition-colors"
                  >
                    {/* All table cells remain the same */}
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
                    <td className="py-3 px-4">
                      <Badge variant={product.type === 'Sellable' ? 'default' : 'secondary'} className="gap-1.5">
                        {product.type === 'Sellable' ? <Utensils size={14} /> : <Box size={14} />}
                        {product.type === 'Sellable' ? 'وجبة' : 'مادة خام'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{product.category?.name || '-'}</td>
                    <td className="py-3 px-4 font-semibold text-primary">
                      {product.type === 'Sellable' ? product.price?.toFixed(2) : product.cost?.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      {product.stock ?? 0} {product.unit}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={product.is_active ? 'default' : 'destructive'}>
                        {product.is_active ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/products/edit/${product.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                              <AlertDialogDescription>هل أنت متأكد من رغبتك في حذف هذا المنتج؟</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(product.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                تأكيد
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-muted-foreground">
                    <Package className="mx-auto h-12 w-12 opacity-50" />
                    <p className="mt-4">لا توجد منتجات لعرضها.</p>
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
