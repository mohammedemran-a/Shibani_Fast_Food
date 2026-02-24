// frontend/src/components/pos/CartSection.tsx

import React, { memo, useRef, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, Banknote, CreditCard, Wallet, User, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';

// الواجهات تبقى كما هي
export interface CartItem { id: number; name: string; price: number; quantity: number; image: string; }
export interface Customer { id: number; name: string; phone?: string; }

interface CartSectionProps {
  items: CartItem[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemoveItem: (id: number) => void;
  onClearCart: () => void;
  onCheckout: (method: 'cash' | 'wallet' | 'debt') => void;
  customers: Customer[];
  recentCustomers: Customer[]; // **تحسين 1: إضافة قائمة العملاء الأخيرين**
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer | null) => void;
  customerSearch: string;
  onCustomerSearchChange: (query: string) => void;
  isLoadingCustomers: boolean;
  focusCustomerSearch: number;
}

const CartItemRow = memo(({ item, onUpdateQuantity, onRemoveItem }: { item: CartItem; onUpdateQuantity: CartSectionProps['onUpdateQuantity']; onRemoveItem: CartSectionProps['onRemoveItem'] }) => (
    <motion.div layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0"><img src={item.image || '/no-image.svg'} alt={item.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/no-image.svg'; }} /></div>
      <div className="flex-1 min-w-0"><p className="font-medium text-foreground text-sm truncate">{item.name}</p><p className="text-primary font-semibold">${item.price.toFixed(2)}</p></div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}> <Minus className="w-3 h-3" /> </Button>
        <span className="w-6 text-center font-medium">{item.quantity}</span>
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}> <Plus className="w-3 h-3" /> </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onRemoveItem(item.id)}> <Trash2 className="w-3 h-3" /> </Button>
      </div>
    </motion.div>
));

export const CartSection = memo(({
  items, onUpdateQuantity, onRemoveItem, onClearCart, onCheckout,
  customers, recentCustomers, selectedCustomer, onSelectCustomer, customerSearch,
  onCustomerSearchChange, isLoadingCustomers, focusCustomerSearch
}: CartSectionProps) => {
  const { t } = useTranslation();
  const [isCustomerListOpen, setIsCustomerListOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focusCustomerSearch > 0) {
      searchInputRef.current?.focus();
    }
  }, [focusCustomerSearch]);

  const { subtotal, tax, total } = useMemo(() => {
    const sub = items.reduce((s, item) => s + item.price * item.quantity, 0);
    const taxRate = 0.15;
    const t = sub * taxRate;
    return { subtotal: sub, tax: t, total: sub + t };
  }, [items]);

  const displayCustomers = customerSearch ? customers : recentCustomers;

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-primary" /><h3 className="font-semibold text-foreground">{t('pos.cart')}</h3></div><span className="text-sm text-muted-foreground">{items.length} {t('pos.all', { count: items.length })}</span></div></div>
      
      {/* ================================================================= */}
      {/* **تصحيح 3: إعادة هيكلة قسم البحث بالكامل** */}
      {/* ================================================================= */}
      <div className="p-4 border-b border-border">
        <label className="text-sm font-medium text-muted-foreground mb-2 block">{t('pos.customer')}</label>
        {selectedCustomer ? (
          <div className="flex items-center justify-between p-2 rounded-md border border-primary/50 bg-primary/10">
            <div className="flex items-center gap-2 font-medium text-primary">
              <User className="w-4 h-4" />
              <span>{selectedCustomer.name}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-primary" onClick={() => onSelectCustomer(null)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Popover open={isCustomerListOpen} onOpenChange={setIsCustomerListOpen}>
            <PopoverTrigger asChild>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder={t('pos.searchCustomer')}
                  className="w-full pl-9"
                  value={customerSearch}
                  onChange={(e) => onCustomerSearchChange(e.target.value)}
                  onFocus={() => setIsCustomerListOpen(true)}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command>
                <CommandList>
                  <CommandEmpty>{isLoadingCustomers ? t('common.loading') : t('common.noResults')}</CommandEmpty>
                  <CommandGroup heading={customerSearch ? t('common.searchResults') : t('common.recentCustomers')}>
                    <CommandItem onSelect={() => { onSelectCustomer(null); setIsCustomerListOpen(false); }}><User className="me-2 h-4 w-4" /><span>{t('pos.walkInCustomer')}</span></CommandItem>
                    {displayCustomers.map((customer) => (
                      <CommandItem key={customer.id} onSelect={() => { onSelectCustomer(customer); setIsCustomerListOpen(false); onCustomerSearchChange(''); }}>
                        <User className="me-2 h-4 w-4" />
                        <span>{customer.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>{items.length === 0 ? (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-muted-foreground"><ShoppingBag className="w-12 h-12 mb-2 opacity-50" /><p>{t('pos.emptyCart')}</p></motion.div>) : (items.map((item) => (<CartItemRow key={item.id} item={item} onUpdateQuantity={onUpdateQuantity} onRemoveItem={onRemoveItem} />)))}</AnimatePresence>
      </div>
      <div className="p-4 mt-auto border-t border-border space-y-3">
        <div className="space-y-2 text-sm"><div className="flex justify-between text-muted-foreground"><span>{t('pos.subtotal')}</span><span>${subtotal.toFixed(2)}</span></div><div className="flex justify-between text-muted-foreground"><span>{t('pos.tax')} (15%)</span><span>${tax.toFixed(2)}</span></div><div className="flex justify-between text-lg font-bold text-foreground pt-2 border-t border-border"><span>{t('pos.total')}</span><span className="text-primary">${total.toFixed(2)}</span></div></div>
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => onCheckout('cash')} disabled={items.length === 0} className={cn('flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all', 'border-border hover:border-primary/50', 'disabled:opacity-50 disabled:pointer-events-none')}><Banknote className="w-6 h-6 text-orange-500" /><span className="text-xs font-medium">{t('payment.cash')}</span></button>
            <button onClick={() => onCheckout('wallet')} disabled={items.length === 0} className={cn('flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all', 'border-border hover:border-primary/50', 'disabled:opacity-50 disabled:pointer-events-none')}><Wallet className="w-6 h-6 text-blue-500" /><span className="text-xs font-medium">{t('payment.wallet')}</span></button>
            <button onClick={() => onCheckout('debt')} disabled={items.length === 0} className={cn('flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all', 'border-border hover:border-primary/50', 'disabled:opacity-50 disabled:pointer-events-none')}><CreditCard className="w-6 h-6 text-green-500" /><span className="text-xs font-medium">{t('payment.credit')}</span></button>
          </div>
          <Button variant="outline" className="w-full" onClick={onClearCart} disabled={items.length === 0}><Trash2 className="w-4 h-4 me-2" />{t('pos.clear')}</Button>
        </div>
      </div>
    </div>
  );
});
