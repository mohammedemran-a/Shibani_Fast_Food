import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';
import { purchaseService } from '@/api/purchaseService';
import { supplierService } from '@/api/supplierService';
import { productService } from '@/api/productService';

interface PurchaseItem {
  id: number;
  product_id: number;
  productName: string;
  quantity: number;
  unit_price: number;
  total: number;
}

const AddPurchase: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isRTL } = useTheme();
  
  const [formData, setFormData] = useState({
    supplier_id: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    notes: '',
    paid_amount: 0,
  });
  
  const [items, setItems] = useState<PurchaseItem[]>([
    { id: 1, product_id: 0, productName: '', quantity: 1, unit_price: 0, total: 0 }
  ]);
  
  const [taxAmount, setTaxAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  // جلب الموردين
  const { data: suppliersData } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => supplierService.getSuppliers(),
  });

  // جلب المنتجات
  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: () => productService.getProducts(),
  });

  // إنشاء فاتورة شراء
  const createMutation = useMutation({
    mutationFn: (data: any) => purchaseService.createPurchase(data),
    onSuccess: () => {
      toast.success('تم إضافة فاتورة الشراء بنجاح');
      navigate('/purchases');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'فشل إضافة فاتورة الشراء');
    },
  });

  const suppliers = suppliersData?.data?.data || [];
  const products = productsData?.data?.data || [];

  const handleAddItem = () => {
    setItems([...items, { 
      id: Date.now(), 
      product_id: 0,
      productName: '', 
      quantity: 1, 
      unit_price: 0, 
      total: 0 
    }]);
  };

  const handleRemoveItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleItemChange = (id: number, field: string, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'product_id') {
          const product = products.find((p: any) => p.id === Number(value));
          updated.productName = product?.name || '';
          updated.unit_price = product?.purchase_price || 0;
        }
        updated.total = updated.quantity * updated.unit_price;
        return updated;
      }
      return item;
    }));
  };

  // حساب المجموع الفرعي
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  
  // حساب المجموع الإجمالي
  const totalAmount = subtotal + taxAmount - discountAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.supplier_id) {
      toast.error('يرجى اختيار المورد');
      return;
    }
    
    if (items.some(item => !item.product_id || item.quantity <= 0)) {
      toast.error('يرجى ملء جميع بيانات المنتجات');
      return;
    }

    const purchaseData = {
      supplier_id: Number(formData.supplier_id),
      invoice_date: formData.invoice_date,
      due_date: formData.due_date || undefined,
      items: items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
      tax_amount: taxAmount,
      discount_amount: discountAmount,
      paid_amount: formData.paid_amount,
      notes: formData.notes,
    };

    createMutation.mutate(purchaseData);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <BackIcon className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">إضافة فاتورة شراء</h1>
          <p className="text-muted-foreground mt-1">أضف فاتورة شراء جديدة من المورد</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* تفاصيل الفاتورة */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 space-y-4 lg:col-span-1"
          >
            <h3 className="font-semibold text-foreground text-lg">تفاصيل الفاتورة</h3>
            
            <div className="space-y-2">
              <Label>المورد *</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المورد" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier: any) => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice_date">تاريخ الفاتورة *</Label>
              <Input
                id="invoice_date"
                type="date"
                value={formData.invoice_date}
                onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">تاريخ الاستحقاق</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="ملاحظات إضافية"
              />
            </div>

            {/* ملخص المبالغ */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">المجموع الفرعي:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax">الضريبة ($)</Label>
                <Input
                  id="tax"
                  type="number"
                  step="0.01"
                  min="0"
                  value={taxAmount}
                  onChange={(e) => setTaxAmount(Number(e.target.value))}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount">الخصم ($)</Label>
                <Input
                  id="discount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  placeholder="0.00"
                />
              </div>

              <div className="flex justify-between text-sm pt-2 border-t">
                <span className="text-muted-foreground">المجموع الإجمالي:</span>
                <span className="font-bold text-lg text-primary">${totalAmount.toFixed(2)}</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paid">المبلغ المدفوع ($)</Label>
                <Input
                  id="paid"
                  type="number"
                  step="0.01"
                  min="0"
                  max={totalAmount}
                  value={formData.paid_amount}
                  onChange={(e) => setFormData({ ...formData, paid_amount: Number(e.target.value) })}
                  placeholder="0.00"
                />
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">المتبقي:</span>
                <span className="font-medium text-destructive">
                  ${(totalAmount - formData.paid_amount).toFixed(2)}
                </span>
              </div>
            </div>
          </motion.div>

          {/* المنتجات */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 space-y-4 lg:col-span-2"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-lg">المنتجات</h3>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className="gap-2">
                <Plus className="w-4 h-4" />
                إضافة منتج
              </Button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="grid grid-cols-12 gap-3 items-end p-4 bg-muted/30 rounded-lg"
                >
                  <div className="col-span-12 sm:col-span-4 space-y-2">
                    <Label>المنتج</Label>
                    <Select 
                      value={item.product_id.toString()}
                      onValueChange={(value) => handleItemChange(item.id, 'product_id', Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المنتج" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product: any) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name} ({product.sku})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-6 sm:col-span-2 space-y-2">
                    <Label>الكمية</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-2 space-y-2">
                    <Label>سعر الوحدة</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(item.id, 'unit_price', Number(e.target.value))}
                    />
                  </div>
                  <div className="col-span-10 sm:col-span-3 space-y-2">
                    <Label>الإجمالي</Label>
                    <Input
                      value={`$${item.total.toFixed(2)}`}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={items.length === 1}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            {t('common.cancel')}
          </Button>
          <Button 
            type="submit" 
            className="gradient-primary border-0 gap-2"
            disabled={createMutation.isPending}
          >
            <Save className="w-4 h-4" />
            {createMutation.isPending ? 'جاري الحفظ...' : t('common.save')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddPurchase;
