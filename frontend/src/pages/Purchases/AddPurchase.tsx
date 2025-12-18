import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';

interface PurchaseItem {
  id: number;
  productId: string;
  productName: string;
  quantity: number;
  purchasePrice: number;
  total: number;
}

const suppliers = [
  { id: 1, name: 'شركة الأغذية المتحدة' },
  { id: 2, name: 'مصنع المشروبات الوطني' },
  { id: 3, name: 'شركة الألبان الطازجة' },
];

const products = [
  { id: 1, name: 'قهوة عربية', sku: 'PRD-001' },
  { id: 2, name: 'شاي أخضر', sku: 'PRD-002' },
  { id: 3, name: 'عصير برتقال', sku: 'PRD-003' },
  { id: 4, name: 'بسكويت شوكولاتة', sku: 'PRD-004' },
  { id: 5, name: 'حليب طازج', sku: 'PRD-005' },
];

const AddPurchase: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isRTL } = useTheme();
  const [formData, setFormData] = React.useState({
    supplierId: '',
    invoiceNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [items, setItems] = React.useState<PurchaseItem[]>([
    { id: 1, productId: '', productName: '', quantity: 1, purchasePrice: 0, total: 0 }
  ]);

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const handleAddItem = () => {
    setItems([...items, { 
      id: Date.now(), 
      productId: '', 
      productName: '', 
      quantity: 1, 
      purchasePrice: 0, 
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
        if (field === 'productId') {
          const product = products.find(p => p.id.toString() === value);
          updated.productName = product?.name || '';
        }
        updated.total = updated.quantity * updated.purchasePrice;
        return updated;
      }
      return item;
    }));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplierId) {
      toast.error(t('purchases.selectSupplier'));
      return;
    }
    if (items.some(item => !item.productId || item.quantity <= 0)) {
      toast.error(t('purchases.fillAllItems'));
      return;
    }
    // Here we would update stock quantities
    toast.success(t('purchases.invoiceAdded'));
    navigate('/purchases');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <BackIcon className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('purchases.addInvoice')}</h1>
          <p className="text-muted-foreground mt-1">{t('purchases.addInvoiceDesc')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 space-y-4 lg:col-span-1"
          >
            <h3 className="font-semibold text-foreground text-lg">{t('purchases.invoiceDetails')}</h3>
            
            <div className="space-y-2">
              <Label>{t('purchases.supplier')} *</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, supplierId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={t('purchases.selectSupplier')} />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">{t('purchases.invoiceNumber')}</Label>
              <Input
                id="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                placeholder="INV-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchaseDate">{t('purchases.date')}</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              />
            </div>

            <div className="p-4 bg-primary/10 rounded-lg mt-4">
              <p className="text-sm text-muted-foreground">{t('pos.total')}</p>
              <p className="text-2xl font-bold text-primary">${totalAmount.toFixed(2)}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 space-y-4 lg:col-span-2"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-lg">{t('purchases.items')}</h3>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className="gap-2">
                <Plus className="w-4 h-4" />
                {t('purchases.addItem')}
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
                    <Label>{t('products.name')}</Label>
                    <Select 
                      value={item.productId}
                      onValueChange={(value) => handleItemChange(item.id, 'productId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('purchases.selectProduct')} />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map(product => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name} ({product.sku})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-6 sm:col-span-2 space-y-2">
                    <Label>{t('products.quantity')}</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-2 space-y-2">
                    <Label>{t('products.purchasePrice')}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.purchasePrice}
                      onChange={(e) => handleItemChange(item.id, 'purchasePrice', Number(e.target.value))}
                    />
                  </div>
                  <div className="col-span-10 sm:col-span-3 space-y-2">
                    <Label>{t('pos.total')}</Label>
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
          <Button type="submit" className="gradient-primary border-0 gap-2">
            <Save className="w-4 h-4" />
            {t('common.save')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddPurchase;
