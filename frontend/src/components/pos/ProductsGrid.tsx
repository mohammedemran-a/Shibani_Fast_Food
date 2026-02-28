import React, { useState, useRef, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import apiClient from '@/api/apiClient';
import { motion } from 'framer-motion';
import { Loader2, Search, ScanBarcode, Package } from 'lucide-react'; // ✅ استيراد أيقونة Package
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PosProduct, Category } from '@/types';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';

interface ProductsGridProps {
  onAddToCart: (product: PosProduct) => void;
}

export const ProductsGrid: React.FC<ProductsGridProps> = ({ onAddToCart }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [barcodeInput, setBarcodeInput] = useState('');
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const debouncedBarcode = useDebounce(barcodeInput, 150);

  const { data: productsResponse, isLoading } = useQuery({
    queryKey: ['pos_products', debouncedSearch, selectedCategory],
    queryFn: async () => {
      const response = await apiClient.get('/pos/products', {
        params: {
          search: debouncedSearch,
          category_id: selectedCategory,
        }
      });
      return response.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });

  const { data: categoriesResponse } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => (await apiClient.get('/categories')).data?.data?.data || [],
    staleTime: Infinity,
  });

  const products = productsResponse?.data || [];
  const categories = [{ id: 'all', name: 'الكل' }, ...(categoriesResponse || [])];

  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  const handleBarcodeSubmit = (barcode: string) => {
    if (!barcode.trim()) return;

    const productFound = products.find(p => 
      p.sellable_units.some(u => u.barcode === barcode.trim())
    );

    if (productFound) {
      onAddToCart(productFound);
    } else {
      toast.error(`باركود غير معروف: ${barcode}`);
    }
    
    setBarcodeInput('');
  };

  useEffect(() => {
    if (!debouncedBarcode || isLoading) return;
    handleBarcodeSubmit(debouncedBarcode);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedBarcode, isLoading]);

  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBarcodeSubmit(barcodeInput);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl border p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="relative">
          <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
          <Input
            ref={barcodeInputRef}
            placeholder="امسح الباركود هنا..."
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            onKeyDown={handleBarcodeKeyDown}
            className="pl-10 h-11 text-lg font-mono"
            autoComplete="off"
          />
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="أو ابحث بالاسم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-11"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === String(category.id) ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(String(category.id))}
            className="whitespace-nowrap"
          >
            {category.name}
          </Button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 -mr-2">
        {isLoading && products.length === 0 ? (
          <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : products.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">لا توجد منتجات تطابق البحث.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {products.map((product) => (
              <motion.button
                key={product.id}
                layout
                onClick={() => onAddToCart(product)}
                disabled={product.total_stock_in_base_units <= 0}
                className={cn(
                  "p-2 text-start rounded-lg border transition-all flex flex-col",
                  "hover:border-primary hover:shadow-md",
                  product.total_stock_in_base_units <= 0 && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="aspect-square mb-2 rounded-md overflow-hidden bg-muted">
                  <img src={product.image_url || '/no-image.svg'} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <h4 className="font-medium text-sm line-clamp-2 flex-grow">{product.name}</h4>
                
                {/* ✅ =================================================================== */}
                {/* ✅ الحل: إضافة قسم جديد لعرض السعر والمخزون */}
                {/* ✅ =================================================================== */}
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm font-bold text-primary">
                    ${product.sellable_units.find(u => u.conversion_factor === 1)?.selling_price.toFixed(2) || '0.00'}
                  </p>
                  <div className={cn(
                    "flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                    product.total_stock_in_base_units > 10 ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                  )}>
                    <Package className="w-3 h-3" />
                    <span>{product.total_stock_in_base_units}</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
