import React, { useState, useMemo } from 'react';
import { useRestaurantProducts } from '../../hooks/useRestaurantProducts';
import { useDebounce } from '../../hooks/useDebounce';
import { RestaurantProduct } from '../../types';

import MenuFilters from '../../components/pos/MenuFilters';
import ProductsGrid from '../../components/pos/ProductsGrid';
import OrderDetails from '../../components/pos/OrderDetails';
import ModifiersModal from '../../components/pos/ModifiersModal';

const RestaurantPOSPage: React.FC = () => {
  const { products, categories, isLoading } = useRestaurantProducts();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [productForModifiers, setProductForModifiers] = useState<RestaurantProduct | null>(null);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    return products
      .filter(p => !selectedCategoryId || p.categoryId === selectedCategoryId)
      .filter(p => p.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
  }, [products, selectedCategoryId, debouncedSearchTerm]);

  return (
    <div className="h-screen bg-muted/40 flex" dir="rtl">
      
      <main className="flex-1 flex flex-col overflow-y-auto">
        <MenuFilters
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        <div className="p-4 flex-grow">
          <ProductsGrid 
            products={filteredProducts} 
            isLoading={isLoading}
            onProductSelect={setProductForModifiers}
          />
        </div>
      </main>
      
      <aside className="w-full max-w-md lg:w-[420px] shrink-0 border-r bg-background shadow-lg">
        <OrderDetails />
      </aside>

      {productForModifiers && (
        <ModifiersModal
          product={productForModifiers}
          onClose={() => setProductForModifiers(null)}
        />
      )}
    </div>
  );
};

export default RestaurantPOSPage;
