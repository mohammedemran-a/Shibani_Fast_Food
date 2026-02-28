// src/components/pos/CustomerSearch.tsx

import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api/apiClient';
import { User, Search, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useDebounce } from '@/hooks/useDebounce';
import { Customer } from '@/types';

interface CustomerSearchProps {
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer | null) => void;
  focusTrigger: number; // ✅ استقبال "النبضة" أو "الأمر"
}

export const CustomerSearch: React.FC<CustomerSearchProps> = ({ selectedCustomer, onSelectCustomer, focusTrigger }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ✅ الاستجابة لـ "أمر التركيز" القادم من المكون الأب
  useEffect(() => {
    // يتم تفعيل هذا التأثير فقط عندما تتغير قيمة focusTrigger وتكون أكبر من صفر
    if (focusTrigger > 0) {
      searchInputRef.current?.focus(); // التركيز على حقل البحث
      setIsPopoverOpen(true); // فتح قائمة الاقتراحات
    }
  }, [focusTrigger]); // الاعتمادية هي focusTrigger

  const { data: recentCustomers = [] } = useQuery<Customer[]>({
    queryKey: ['recentCustomers'],
    queryFn: async () => (await apiClient.get('/customers', { params: { per_page: 5, sort_by: 'last_purchase' } })).data?.data?.data || [],
    staleTime: 300000,
  });

  const { data: searchedCustomers = [], isLoading: isLoadingSearch } = useQuery<Customer[]>({
    queryKey: ['customer_search', debouncedSearchQuery],
    queryFn: async () => (await apiClient.get('/customers', { params: { search: debouncedSearchQuery, per_page: 10 } })).data?.data?.data || [],
    enabled: !!debouncedSearchQuery,
  });

  const handleSelect = (customer: Customer | null) => {
    onSelectCustomer(customer);
    setSearchQuery('');
    setIsPopoverOpen(false);
  };

  const displayCustomers = debouncedSearchQuery ? searchedCustomers : recentCustomers;
  const listHeading = debouncedSearchQuery ? 'نتائج البحث' : 'العملاء الأخيرون';

  if (selectedCustomer) {
    return (
      <div className="p-3 border-b">
        <div className="flex items-center justify-between p-2 rounded-md border border-primary/30 bg-primary/10">
          <div className="flex items-center gap-2 font-semibold text-primary text-sm">
            <User className="w-4 h-4" />
            <span>{selectedCustomer.name}</span>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-primary" onClick={() => onSelectCustomer(null)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 border-b">
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef} // ✅ ربط الـ ref
              placeholder="ابحث عن عميل أو اختر..."
              className="w-full pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsPopoverOpen(true)}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandList>
              <CommandEmpty>
                {isLoadingSearch ? <div className="flex items-center justify-center p-4"><Loader2 className="w-4 h-4 animate-spin" /></div> : 'لا توجد نتائج.'}
              </CommandEmpty>
              <CommandGroup heading={listHeading}>
                <CommandItem onSelect={() => handleSelect(null)}>
                  <User className="me-2 h-4 w-4" />
                  <span>عميل زائر (نقدي)</span>
                </CommandItem>
                {displayCustomers.map((customer) => (
                  <CommandItem key={customer.id} onSelect={() => handleSelect(customer)}>
                    <User className="me-2 h-4 w-4" />
                    <span>{customer.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
