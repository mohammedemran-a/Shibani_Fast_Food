import React from 'react';
import { RestaurantProduct } from '../../types';
import { Plus } from 'lucide-react';

interface ProductCardProps {
  product: RestaurantProduct;
  onSelect: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  return (
    <div 
      onClick={onSelect}
      className="bg-card rounded-xl overflow-hidden shadow-sm border border-transparent hover:border-primary hover:shadow-lg transition-all duration-300 cursor-pointer group"
    >
      <div className="relative">
        <img 
          src={product.imageUrl || 'https://picsum.photos/400/300'} 
          alt={product.name}
          className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Plus size={16} />
        </div>
      </div>
      <div className="p-3 text-center">
        <h3 className="font-bold text-sm truncate">{product.name}</h3>
        <p className="text-primary font-semibold text-base mt-1">{product.price.toFixed(2 )} ر.ي</p>
      </div>
    </div>
  );
};

export default ProductCard;
