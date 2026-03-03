import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { searchProducts } from '@/api'; 
import { Product } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';

interface ProductSearchComboboxProps {
  onSelect: (product: Product) => void;
  productType: 'Sellable' | 'RawMaterial';
  placeholder?: string;
}

export function ProductSearchCombobox({ 
  onSelect, 
  productType,
  placeholder = "ابحث عن مادة خام..."
}: ProductSearchComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // ✅✅✅ هذا هو المنطق الجديد ✅✅✅
  // يتم جلب البيانات الأولية (عندما يكون debouncedSearchQuery فارغًا)
  // أو نتائج البحث (عندما يحتوي debouncedSearchQuery على قيمة).
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['productSearch', debouncedSearchQuery, productType],
    queryFn: () => searchProducts(debouncedSearchQuery, productType),
    // جلب البيانات فقط إذا كانت القائمة مفتوحة
    enabled: open, 
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className="truncate">{placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            value={searchQuery}
            onValueChange={setSearchQuery}
            placeholder="ابحث بالاسم..."
          />
          <CommandList>
            {isLoading && (
              <div className="p-4 text-center text-sm text-muted-foreground flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري التحميل...
              </div>
            )}
            {!isLoading && !products.length && (
                <CommandEmpty>لم يتم العثور على منتجات.</CommandEmpty>
            )}
            <CommandGroup>
              {products.map((product) => (
                <CommandItem
                  key={product.id}
                  value={product.name}
                  onSelect={() => {
                    onSelect(product);
                    setSearchQuery(''); // تفريغ حقل البحث بعد الاختيار
                    setOpen(false);
                  }}
                >
                  {product.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
