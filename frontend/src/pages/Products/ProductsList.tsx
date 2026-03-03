import React from 'react';
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
import { Product } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ProductsList: React.FC = () => {
  const { 
    products, 
    loading, 
    error, 
    removeProduct, 
    setFilters, 
    filters,
    pagination,
    setPage
  } = useProducts();

  const handleDelete = (id: number) => {
    toast.promise(removeProduct(id), {
      loading: 'جاري حذف المنتج...',
      success: 'تم حذف المنتج بنجاح!',
      error: 'فشل في حذف المنتج.',
    });
  };

  if (loading && !products?.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 text-center text-destructive">
        <p>خطأ في جلب المنتجات: {error}</p>
      </div>
    );
  }

  const safeProducts: Product[] = Array.isArray(products) ? products : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">إدارة المنتجات</h1>
          <p className="text-muted-foreground">إدارة الوجبات والمواد الخام في النظام</p>
        </div>
        <Link to="/products/add">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            إضافة منتج
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardContent className="p-4">
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
              value={filters.type || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
              className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:ring-ring focus:ring-2 focus:ring-offset-2"
            >
              <option value="">كل الأنواع</option>
              <option value="Sellable">وجبات</option>
              <option value="RawMaterial">مواد خام</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المنتج</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الفئة</TableHead>
                  <TableHead>السعر</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-end">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeProducts.length > 0 ? (
                  safeProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.type === 'Sellable' ? 'default' : 'secondary'} className="gap-1.5">
                          {product.type === 'Sellable' ? <Utensils size={14} /> : <Box size={14} />}
                          {product.type === 'Sellable' ? 'وجبة' : 'مادة خام'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{product.category?.name || '-'}</TableCell>
                      <TableCell className="font-semibold text-primary">
                        {/* ✅ يعرض السعر فقط إذا كان المنتج وجبة */}
                        {product.type === 'Sellable' ? `${product.price?.toFixed(2) || '0.00'}` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.is_active ? 'success' : 'destructive'}>
                          {product.is_active ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-end">
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
                                <AlertDialogDescription>هل أنت متأكد من رغبتك في حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
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
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                      <Package className="mx-auto h-12 w-12 opacity-50" />
                      <p className="mt-4">لا توجد منتجات تطابق البحث.</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setPage(pagination.current_page - 1)}
            disabled={pagination.current_page === 1}
          >
            السابق
          </Button>
          <span className="text-sm text-muted-foreground">
            صفحة {pagination.current_page} من {pagination.last_page}
          </span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setPage(pagination.current_page + 1)}
            disabled={pagination.current_page === pagination.last_page}
          >
            التالي
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductsList;
