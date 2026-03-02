import React from 'react';
import { RestaurantProduct } from '../../types';
import ProductCard from './ProductCard';
import { useCartStore } from '../../hooks/useCartStore';
// ✅ الخطوة 1: استيراد toast من مكتبة sonner الصحيحة
import { toast } from 'sonner';

interface ProductsGridProps {
  products: RestaurantProduct[];
  isLoading: boolean;
  onProductSelect: (product: RestaurantProduct) => void;
}

const ProductsGrid: React.FC<ProductsGridProps> = ({ products, isLoading, onProductSelect }) => {
  const { addItem } = useCartStore();

  const handleProductClick = (product: RestaurantProduct) => {
    const hasModifiers = product.availableModifiers && product.availableModifiers.length > 0;
    const hasBaseIngredients = product.baseIngredients && product.baseIngredients.length > 0;

    if (hasModifiers || hasBaseIngredients) {
      // إذا كان المنتج يتطلب تخصيصًا، افتح النافذة المنبثقة
      onProductSelect(product);
    } else {
      // إذا كان المنتج بسيطًا، أضفه مباشرة
      const wasAdded = addItem(product, [], []);
      
      // ✅ الخطوة 2: إذا فشلت الإضافة، استخدم toast.error() من sonner
      if (!wasAdded) {
        toast.error("يرجى تحديد نوع الطلب أولاً قبل إضافة المنتجات.");
      }
    }
  };

  if (isLoading) {
    return <p className="text-center">جاري تحميل المنتجات...</p>;
  }

  if (products.length === 0) {
    return <p className="text-center text-muted-foreground mt-8">لا توجد منتجات تطابق هذا البحث.</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {products.map(product => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onSelect={() => handleProductClick(product)} 
        />
      ))}
    </div>
  );
};

export default ProductsGrid;
