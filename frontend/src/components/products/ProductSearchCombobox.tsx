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
import { searchProductsForPurchase, Product } from '@/api/productService';
import { useDebounce } from '@/hooks/useDebounce'; // سنحتاج لإنشاء هذا الخطاف

interface ProductSearchComboboxProps {
  value?: number;
  selectedValue?: Product | null;
  onChange: (product: Product | null) => void;
  disabled?: boolean;
}

export function ProductSearchCombobox({ value, selectedValue, onChange, disabled }: ProductSearchComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // تأخير 300ms

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['purchaseProductSearch', debouncedSearchQuery],
    queryFn: () => searchProductsForPurchase(debouncedSearchQuery),
    enabled: debouncedSearchQuery.length > 0, // تفعيل البحث فقط عند وجود نص
  });

  const selectedProductDisplay = useMemo(() => {
    if (selectedValue) {
      return `${selectedValue.name} (${selectedValue.sku})`;
    }
    return "ابحث عن منتج بالاسم أو SKU...";
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
            placeholder="ابحث بالاسم أو SKU..."
          />
          <CommandList>
            {isLoading && (
              <div className="p-4 text-center text-sm text-muted-foreground flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري البحث...
              </div>
            )}
            {!isLoading && !products.length && debouncedSearchQuery.length > 0 && (
                <CommandEmpty>لم يتم العثور على منتجات.</CommandEmpty>
            )}
            <CommandGroup>
              {products.map((product) => (
                <CommandItem
                  key={product.id}
                  value={`${product.name} ${product.sku}`}
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
                  {product.name} ({product.sku})
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
