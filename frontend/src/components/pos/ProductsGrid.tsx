import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Search, ScanBarcode, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';



interface Product {
  id: number;
  name: string;
  barcode: string;
  selling_price: number;
  category_id: number;
  quantity: number;
  image?: string;
  image_url?: string;
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

  const { data: productsData, isLoading } = useProducts({ is_active: true, per_page: 200 });
  
  const { data: categoriesData } = useCategories();
  const apiCategories = categoriesData?.data || [];
  
  const categories = [
    { id: 'all', name: t('pos.all') },
    ...apiCategories.map((cat: any) => ({ id: cat.id.toString(), name: cat.name }))
  ];

  const products = productsData?.data?.data || [];

  // ** تعديل 1: إنشاء دالة مساعدة لإنشاء كائن السلة **
  const createCartProduct = (product: Product) => {
    return {
      id: product.id,
      name: product.name,
      barcode: product.barcode,
      price: Number(product.selling_price || 0),
      stock: Number(product.quantity || 0),
      image: product.image_url || '/no-image.svg',
    };
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (barcodeInputRef.current) {
        barcodeInputRef.current.focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleBarcodeChange = (value: string) => {
    setBarcodeInput(value);
    
    if (value.length >= 8) {
      const timer = setTimeout(() => {
        const product = products.find((p: Product) => 
          p.barcode && p.barcode.toString().trim() === value.trim()
        );
        
        if (product) {
          // ** تعديل 2: استخدام الدالة المساعدة **
          onAddToCart(createCartProduct(product));
          toast.success(`${t('pos.addedToCart')} ${product.name}`);
          setBarcodeInput('');
          setTimeout(() => barcodeInputRef.current?.focus(), 10);
        } else if (value.length >= 10) {
          toast.error(t('pos.productNotFound') + ': ' + value);
          setBarcodeInput('');
          setTimeout(() => barcodeInputRef.current?.focus(), 10);
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  };

  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && barcodeInput.trim()) {
      e.preventDefault();
      const product = products.find((p: Product) => 
        p.barcode && p.barcode.toString().trim() === barcodeInput.trim()
      );
      if (product) {
        // ** تعديل 3: استخدام الدالة المساعدة (هذا يصلح الخطأ) **
        onAddToCart(createCartProduct(product));
        toast.success(`${t('pos.addedToCart')} ${product.name}`);
      } else {
        toast.error(t('pos.productNotFound') + ': ' + barcodeInput);
      }
      setBarcodeInput('');
      setTimeout(() => barcodeInputRef.current?.focus(), 10);
    }
  };

  const filteredProducts = products.filter((product: Product) => {
    const matchesCategory = selectedCategory === 'all' || product.category_id?.toString() === selectedCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      product.name?.toLowerCase().includes(searchLower) ||
      product.barcode?.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });



  return (
    <div className="flex flex-col h-full">
      {/* Barcode Scanner Input - Always visible and focused */}
      <div className="relative mb-3">
        <ScanBarcode className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
        <Input
          ref={barcodeInputRef}
          placeholder={t('pos.scanBarcode')}
          value={barcodeInput}
          onChange={(e) => handleBarcodeChange(e.target.value)}
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
            {category.name}
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pb-4">
            {filteredProducts.map((product: Product, index: number) => {
              // ** تعديل 4: إزالة التعريف المكرر لـ cartProduct **
              return (
                <motion.button
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => {
                    if (product.quantity <= 0) {
                      toast.error(t('pos.outOfStock') || 'Out of stock');
                      return;
                    }
                    // ** تعديل 5: استخدام الدالة المساعدة مباشرة **
                    onAddToCart(createCartProduct(product));
                    toast.success(`${t('pos.addedToCart')} ${product.name}`);
                  }}
                  disabled={product.quantity <= 0}
                  className={cn(
                    'glass-card p-2 sm:p-3 text-start hover:scale-105 transition-all flex flex-col',
                    'hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20',
                    product.quantity === 0 && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <div className="aspect-square mb-2 rounded-lg overflow-hidden bg-muted">
                    <img 
                      src={product.image_url || '/no-image.svg'} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/no-image.svg';
                      }}
                    />
                  </div>
                  <h4 className="font-medium text-sm sm:text-base mb-1 line-clamp-2 flex-grow min-h-[2.5rem]">
                    {product.name}
                  </h4>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-base sm:text-lg font-bold text-primary">
                      ${Number(product.selling_price || 0).toFixed(2)}
                    </span>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium',
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
