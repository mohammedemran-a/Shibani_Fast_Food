import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// ✅ الخطوة 1: استيراد الدالة الصحيحة والنوع الصحيح
import { searchProducts } from '@/api'; 
import { Product } from '@/types';

// ✅ الخطوة 2: استيراد الـ hook المساعد
import { useDebounce } from '@/hooks/useDebounce';

interface ProductSearchComboboxProps {
  value?: number; // ID المنتج المختار
  selectedValue?: Product | null; // كائن المنتج المختار
  onChange: (product: Product | null) => void;
  disabled?: boolean;
  productType?: 'Sellable' | 'RawMaterial'; // لتحديد نوع المنتجات التي نبحث عنها
}

export function ProductSearchCombobox({ 
  value, 
  selectedValue, 
  onChange, 
  disabled,
  productType // يمكن تمرير هذا لتحديد نوع البحث
}: ProductSearchComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // ✅ الخطوة 3: استخدام الدالة الصحيحة في useQuery
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['productSearch', debouncedSearchQuery, productType], // إضافة productType لمفتاح الكويري
    queryFn: () => searchProducts(debouncedSearchQuery, productType), // تمرير نوع المنتج
    enabled: debouncedSearchQuery.length > 1, // تفعيل البحث فقط عند وجود حرفين أو أكثر
  });

  const selectedProductDisplay = useMemo(() => {
    if (selectedValue) {
      return selectedValue.name;
    }
    return "ابحث عن منتج...";
  }, [selectedValue]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          <span className="truncate">{selectedProductDisplay}</span>
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
                جاري البحث...
              </div>
            )}
            {!isLoading && !products.length && debouncedSearchQuery.length > 1 && (
                <CommandEmpty>لم يتم العثور على منتجات.</CommandEmpty>
            )}
            <CommandGroup>
              {products.map((product) => (
                <CommandItem
                  key={product.id}
                  value={product.name} // استخدام الاسم للفلترة الداخلية (إذا كانت مفعلة)
                  onSelect={() => {
                    onChange(product);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === product.id ? "opacity-100" : "opacity-0"
                    )}
                  />
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
