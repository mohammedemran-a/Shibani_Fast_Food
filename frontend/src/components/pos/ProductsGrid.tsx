import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Search, ScanBarcode } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const categories = [
  { id: 'all', nameKey: 'pos.all' },
  { id: 'drinks', nameKey: 'categories.drinks' },
  { id: 'snacks', nameKey: 'categories.snacks' },
  { id: 'dairy', nameKey: 'categories.dairy' },
  { id: 'bakery', nameKey: 'categories.bakery' },
];

const products = [
  { id: 1, name: 'قهوة عربية', nameEn: 'Arabic Coffee', barcode: '6281000001234', price: 3.00, category: 'drinks', stock: 50, image: '☕' },
  { id: 2, name: 'شاي أخضر', nameEn: 'Green Tea', barcode: '6281000001235', price: 2.00, category: 'drinks', stock: 80, image: '🍵' },
  { id: 3, name: 'عصير برتقال', nameEn: 'Orange Juice', barcode: '6281000001236', price: 3.50, category: 'drinks', stock: 30, image: '🍊' },
  { id: 4, name: 'ماء معدني', nameEn: 'Mineral Water', barcode: '6281000001237', price: 1.00, category: 'drinks', stock: 100, image: '💧' },
  { id: 5, name: 'بسكويت شوكولاتة', nameEn: 'Chocolate Biscuit', barcode: '6281000001238', price: 2.00, category: 'snacks', stock: 45, image: '🍪' },
  { id: 6, name: 'شيبس', nameEn: 'Chips', barcode: '6281000001239', price: 1.50, category: 'snacks', stock: 60, image: '🥔' },
  { id: 7, name: 'حليب طازج', nameEn: 'Fresh Milk', barcode: '6281000001240', price: 2.50, category: 'dairy', stock: 25, image: '🥛' },
  { id: 8, name: 'جبنة', nameEn: 'Cheese', barcode: '6281000001241', price: 4.00, category: 'dairy', stock: 20, image: '🧀' },
  { id: 9, name: 'خبز', nameEn: 'Bread', barcode: '6281000001242', price: 1.00, category: 'bakery', stock: 40, image: '🍞' },
  { id: 10, name: 'كرواسون', nameEn: 'Croissant', barcode: '6281000001243', price: 2.50, category: 'bakery', stock: 35, image: '🥐' },
  { id: 11, name: 'كولا', nameEn: 'Cola', barcode: '6281000001244', price: 1.50, category: 'drinks', stock: 70, image: '🥤' },
  { id: 12, name: 'زبادي', nameEn: 'Yogurt', barcode: '6281000001245', price: 1.50, category: 'dairy', stock: 55, image: '🥛' },
];

interface ProductsGridProps {
  onAddToCart: (product: typeof products[0]) => void;
}

export const ProductsGrid: React.FC<ProductsGridProps> = ({ onAddToCart }) => {
  const { t, i18n } = useTranslation();
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [barcodeInput, setBarcodeInput] = React.useState('');
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus barcode input on mount and keep focus
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  // Handle barcode scanner input (Enter key)
  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && barcodeInput.trim()) {
      e.preventDefault();
      const product = products.find(p => p.barcode === barcodeInput.trim());
      if (product) {
        onAddToCart(product);
        toast.success(`${t('pos.addedToCart')} ${i18n.language === 'ar' ? product.name : product.nameEn}`);
      } else {
        toast.error(t('pos.productNotFound'));
      }
      setBarcodeInput('');
      // Re-focus the barcode input
      setTimeout(() => barcodeInputRef.current?.focus(), 10);
    }
  };

  // Keep focus on barcode input when clicking elsewhere in POS
  const handleContainerClick = () => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      product.name.toLowerCase().includes(searchLower) ||
      product.nameEn.toLowerCase().includes(searchLower) ||
      product.barcode.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full" onClick={handleContainerClick}>
      {/* Barcode Scanner Input - Always visible and focused */}
      <div className="relative mb-3">
        <ScanBarcode className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
        <Input
          ref={barcodeInputRef}
          placeholder={t('pos.scanBarcode')}
          value={barcodeInput}
          onChange={(e) => setBarcodeInput(e.target.value)}
          onKeyDown={handleBarcodeKeyDown}
          className="ps-11 bg-primary/5 border-primary/30 focus:border-primary text-lg h-12 font-mono"
          autoComplete="off"
        />
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={t('pos.searchProducts')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="ps-10 bg-card border-border"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              'shrink-0 transition-all',
              selectedCategory === category.id && 'gradient-primary border-0'
            )}
          >
            {t(category.nameKey)}
          </Button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className="pos-product-card"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
            >
              <div className="text-4xl mb-2 text-center">{product.image}</div>
              <h4 className="font-medium text-foreground text-sm truncate">
                {i18n.language === 'ar' ? product.name : product.nameEn}
              </h4>
              <div className="flex items-center justify-between mt-2">
                <span className="font-bold text-primary">${product.price.toFixed(2)}</span>
                <span className="text-xs text-muted-foreground">{product.stock} {t('pos.available')}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
