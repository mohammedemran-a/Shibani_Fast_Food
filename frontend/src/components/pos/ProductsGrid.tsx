import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Search, ScanBarcode, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useProducts } from '@/hooks/useProducts';

const categories = [
  { id: 'all', nameKey: 'pos.all' },
  { id: 'drinks', nameKey: 'categories.drinks' },
  { id: 'snacks', nameKey: 'categories.snacks' },
  { id: 'dairy', nameKey: 'categories.dairy' },
  { id: 'bakery', nameKey: 'categories.bakery' },
];

interface Product {
  id: number;
  name: string;
  name_ar: string;
  barcode: string;
  selling_price: number;
  category_id: number;
  quantity: number;
  image?: string;
}

interface ProductsGridProps {
  onAddToCart: (product: any) => void;
}

export const ProductsGrid: React.FC<ProductsGridProps> = ({ onAddToCart }) => {
  const { t, i18n } = useTranslation();
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [barcodeInput, setBarcodeInput] = React.useState('');
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Fetch products from API
  const { data: productsData, isLoading } = useProducts({
    is_active: true,
  });

  const products = productsData?.data?.data || [];

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
      const product = products.find((p: Product) => p.barcode === barcodeInput.trim());
      if (product) {
        const cartProduct = {
          id: product.id,
          name: product.name_ar,
          nameEn: product.name,
          barcode: product.barcode,
          price: Number(product.selling_price || 0),
          stock: Number(product.quantity || 0),
          image: product.image || '📦',
        };
        onAddToCart(cartProduct);
        toast.success(`${t('pos.addedToCart')} ${i18n.language === 'ar' ? product.name_ar : product.name}`);
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

  const filteredProducts = products.filter((product: Product) => {
    // For now, show all products (category filtering can be added later with category names)
    const matchesCategory = selectedCategory === 'all';
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      product.name_ar.toLowerCase().includes(searchLower) ||
      product.name.toLowerCase().includes(searchLower) ||
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

      {/* Search and Filter */}
      <div className="flex gap-3 mb-3">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('pos.searchProducts')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-10"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-thin">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              'whitespace-nowrap transition-all',
              selectedCategory === category.id && 'gradient-primary border-0'
            )}
          >
            {t(category.nameKey)}
          </Button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            {t('pos.noProducts')}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pb-4">
            {filteredProducts.map((product: Product, index: number) => {
              const cartProduct = {
                id: product.id,
                name: product.name_ar,
                nameEn: product.name,
                barcode: product.barcode,
                price: Number(product.selling_price || 0),
                stock: Number(product.quantity || 0),
                image: product.image || '📦',
              };

              return (
                <motion.button
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => {
                    onAddToCart(cartProduct);
                    toast.success(`${t('pos.addedToCart')} ${i18n.language === 'ar' ? product.name_ar : product.name}`);
                  }}
                  className={cn(
                    'glass-card p-3 text-start hover:scale-105 transition-all',
                    'hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20',
                    product.quantity === 0 && 'opacity-50 cursor-not-allowed'
                  )}
                  disabled={product.quantity === 0}
                >
                  <div className="text-3xl mb-2 text-center">{product.image || '📦'}</div>
                  <h4 className="font-medium text-sm mb-1 line-clamp-2 min-h-[2.5rem]">
                    {i18n.language === 'ar' ? product.name_ar : product.name}
                  </h4>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold text-primary">
                      ${Number(product.selling_price || 0).toFixed(2)}
                    </span>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      product.quantity > 10 ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                    )}>
                      {product.quantity}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
