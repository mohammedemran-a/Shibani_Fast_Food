import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from '@/contexts/ThemeContext';
import { useProduct, useUpdateProduct } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useBrands } from '@/hooks/useBrands';
import { useUnits } from '@/hooks/useUnits';
import { toast } from 'sonner';

const EditProduct: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isRTL } = useTheme();

  // Fetch data
  const { data: productData, isLoading: isLoadingProduct } = useProduct(Number(id));
  const { data: categoriesData } = useCategories();
  const { data: brandsData } = useBrands();
  const { data: unitsData } = useUnits();

  const product = productData?.data;
  const categories = categoriesData?.data || [];
  const brands = brandsData?.data || [];
  const units = unitsData?.data || [];

  const [formData, setFormData] = React.useState({
    name: '',
    name_ar: '',
    sku: '',
    barcode: '',
    category_id: '',
    brand_id: '',
    unit_id: '',
    purchase_price: '',
    selling_price: '',
    quantity: '',
    reorder_level: '',
    description: '',
  });

  const updateProduct = useUpdateProduct();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  // Load product data into form
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        name_ar: product.name_ar || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        category_id: product.category_id?.toString() || '',
        brand_id: product.brand_id?.toString() || '',
        unit_id: product.unit_id?.toString() || '',
        purchase_price: product.purchase_price?.toString() || '',
        selling_price: product.selling_price?.toString() || '',
        quantity: product.quantity?.toString() || '',
        reorder_level: product.reorder_level?.toString() || '',
        description: product.description || '',
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      if (formData.name_ar) {
        submitData.append('name_ar', formData.name_ar);
      }
      submitData.append('sku', formData.sku);
      submitData.append('barcode', formData.barcode);
      submitData.append('category_id', formData.category_id);
      if (formData.brand_id) {
        submitData.append('brand_id', formData.brand_id);
      }
      submitData.append('unit_id', formData.unit_id);
      submitData.append('purchase_price', formData.purchase_price);
      submitData.append('selling_price', formData.selling_price);
      submitData.append('quantity', formData.quantity);
      submitData.append('reorder_level', formData.reorder_level || '10');
      if (formData.description) {
        submitData.append('description', formData.description);
      }

      await updateProduct.mutateAsync({
        id: Number(id),
        data: submitData,
      });

      toast.success('تم تحديث المنتج بنجاح');
      navigate('/products');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في تحديث المنتج');
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">المنتج غير موجود</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <BackIcon className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">تعديل منتج</h1>
          <p className="text-muted-foreground mt-1">تحديث معلومات المنتج</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 space-y-4"
        >
          <h3 className="font-semibold text-foreground text-lg">المعلومات الأساسية</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم (English)</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name_ar">الاسم (عربي)</Label>
              <Input
                id="name_ar"
                value={formData.name_ar}
                onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcode">الباركود</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>الفئة</Label>
              <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name_ar || category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>العلامة التجارية</Label>
              <Select value={formData.brand_id} onValueChange={(value) => setFormData({ ...formData, brand_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر العلامة" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand: any) => (
                    <SelectItem key={brand.id} value={brand.id.toString()}>
                      {brand.name_ar || brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الوحدة</Label>
              <Select value={formData.unit_id} onValueChange={(value) => setFormData({ ...formData, unit_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الوحدة" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit: any) => (
                    <SelectItem key={unit.id} value={unit.id.toString()}>
                      {unit.name_ar || unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Pricing & Stock */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 space-y-4"
        >
          <h3 className="font-semibold text-foreground text-lg">الأسعار والمخزون</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchase_price">سعر الشراء</Label>
              <Input
                id="purchase_price"
                type="number"
                step="0.01"
                value={formData.purchase_price}
                onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="selling_price">سعر البيع</Label>
              <Input
                id="selling_price"
                type="number"
                step="0.01"
                value={formData.selling_price}
                onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">الكمية</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reorder_level">مستوى إعادة الطلب</Label>
              <Input
                id="reorder_level"
                type="number"
                value={formData.reorder_level}
                onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">الوصف</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            إلغاء
          </Button>
          <Button type="submit" className="gap-2" disabled={updateProduct.isPending}>
            {updateProduct.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                حفظ التغييرات
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
