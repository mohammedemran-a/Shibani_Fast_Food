import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { inventoryItemService, InventoryItem } from '@/api/inventoryItemService';

interface InventoryItemSearchComboboxProps {
  value: InventoryItem | null;
  onSelect: (item: InventoryItem | null) => void;
}

export function InventoryItemSearchCombobox({ value, onSelect }: InventoryItemSearchComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data: items, isLoading } = useQuery({
    queryKey: ['inventoryItemsSearch', search],
    queryFn: () => inventoryItemService.searchInventoryItems(search),
    enabled: open && search.length > 0,
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {value ? value.name : "ابحث عن مادة خام..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="اكتب اسم المادة الخام..." 
            onValueChange={setSearch}
            value={search}
          />
          <CommandEmpty>{isLoading ? 'جاري البحث...' : 'لم يتم العثور على مواد.'}</CommandEmpty>
          <CommandGroup>
            {items?.map((item) => (
              <CommandItem
                key={item.id}
                value={item.name}
                onSelect={() => {
                  onSelect(item);
                  setOpen(false);
                }}
              >
                <Check className={cn("mr-2 h-4 w-4", value?.id === item.id ? "opacity-100" : "opacity-0")} />
                {item.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
