import React from 'react';
import { ProductCategory } from '../../types';
import { Search } from 'lucide-react';

interface MenuFiltersProps {
  categories: ProductCategory[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const MenuFilters: React.FC<MenuFiltersProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  searchTerm,
  onSearchChange,
}) => {
  const allCategories = [{ id: null, name: 'الكل' }, ...categories];

  return (
    <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-3">
      {/* شريط البحث */}
      <div className="relative mb-3 px-4">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input
          type="text"
          placeholder="ابحث عن منتج..."
          className="w-full bg-muted rounded-full py-2 pl-8 pr-10 text-base focus:ring-2 focus:ring-primary focus:outline-none transition"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* شريط الفئات الأفقي القابل للتمرير */}
      <div className="px-4 overflow-x-auto pb-2 -mb-2">
        <div className="flex items-center gap-3 whitespace-nowrap">
          {allCategories.map((category) => (
            <button
              key={category.id ?? 'all'}
              onClick={() => onSelectCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors
                ${selectedCategoryId === category.id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted text-muted-foreground hover:bg-primary/20 hover:text-foreground'
                }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenuFilters;
