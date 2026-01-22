// frontend/src/components/pos/CartSection.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, Banknote, CreditCard, Wallet, User, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';

// واجهة لتمثيل كائن المنتج في السلة
export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

// واجهة لتمثيل كائن العميل
export interface Customer {
  id: number;
  name: string;
  phone?: string;
}

// واجهة لخصائص المكون
interface CartSectionProps {
  items: CartItem[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemoveItem: (id: number) => void;
  onClearCart: () => void;
  onCheckout: (method: 'cash' | 'wallet' | 'debt') => void;
  
  customers: Customer[];
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer | null) => void;
  customerSearch: string;
  onCustomerSearchChange: (query: string) => void;
  isLoadingCustomers: boolean;
}

export const CartSection: React.FC<CartSectionProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  customers,
  selectedCustomer,
  onSelectCustomer,
  customerSearch,
  onCustomerSearchChange,
  isLoadingCustomers,
}) => {
  const { t } = useTranslation();
  const [openCustomerSelect, setOpenCustomerSelect] = React.useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxRate = 0.15;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl border border-border overflow-hidden">
      {/* رأس السلة */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">{t('pos.cart')}</h3>
          </div>
          <span className="text-sm text-muted-foreground">
            {items.length} {t('pos.all', { count: items.length })}
          </span>
        </div>
      </div>

      {/* قسم اختيار العميل */}
      <div className="p-4 border-b border-border">
        <label className="text-sm font-medium text-muted-foreground mb-2 block">{t('pos.customer')}</label>
        <Popover open={openCustomerSelect} onOpenChange={setOpenCustomerSelect}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-between"
            >
              {selectedCustomer ? (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {selectedCustomer.name}
                </div>
              ) : (
                <span className="text-muted-foreground">{t('pos.walkInCustomer')}</span>
              )}
              <Search className="ms-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[340px] p-0" align="start">
            <Command>
              <CommandInput 
                placeholder={t('pos.searchCustomer')}
                value={customerSearch}
                onValueChange={onCustomerSearchChange}
              />
              <CommandEmpty>
                {isLoadingCustomers ? t('common.loading') : t('common.noResults')}
              </CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                <CommandItem
                  onSelect={() => {
                    onSelectCustomer(null);
                    setOpenCustomerSelect(false);
                  }}
                >
                  <User className="me-2 h-4 w-4" />
                  <span>{t('pos.walkInCustomer')}</span>
                </CommandItem>
                {customers.map((customer) => (
                  <CommandItem
                    key={customer.id}
                    onSelect={() => {
                      onSelectCustomer(customer);
                      setOpenCustomerSelect(false);
                    }}
                  >
                    <User className="me-2 h-4 w-4" />
                    <span>{customer.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* عناصر السلة */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-muted-foreground"
            >
              <ShoppingBag className="w-12 h-12 mb-2 opacity-50" />
              <p>{t('pos.emptyCart')}</p>
            </motion.div>
          ) : (
            items.map((item) => (
              <motion.div key={item.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img src={item.image || '/no-image.svg'} alt={item.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/no-image.svg'; }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">{item.name}</p>
                  <p className="text-primary font-semibold">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}> <Minus className="w-3 h-3" /> </Button>
                  <span className="w-6 text-center font-medium">{item.quantity}</span>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}> <Plus className="w-3 h-3" /> </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onRemoveItem(item.id)}> <Trash2 className="w-3 h-3" /> </Button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* الملخص وأزرار الدفع */}
      <div className="p-4 mt-auto border-t border-border space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>{t('pos.subtotal')}</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>{t('pos.tax')} (15%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-foreground pt-2 border-t border-border">
            <span>{t('pos.total')}</span>
            <span className="text-primary">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* أزرار طرق الدفع الثلاثة - باستخدام المفاتيح الصحيحة من قسم payment */}
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onCheckout('cash')}
              disabled={items.length === 0}
              className={cn(
                'flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all',
                'border-border hover:border-primary/50',
                'disabled:opacity-50 disabled:pointer-events-none'
              )}
            >
              <Banknote className="w-6 h-6 text-orange-500" />
              <span className="text-xs font-medium">{t('payment.cash')}</span>
            </button>
            <button
              onClick={() => onCheckout('wallet')}
              disabled={items.length === 0}
              className={cn(
                'flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all',
                'border-border hover:border-primary/50',
                'disabled:opacity-50 disabled:pointer-events-none'
              )}
            >
              <Wallet className="w-6 h-6 text-blue-500" />
              <span className="text-xs font-medium">{t('payment.wallet')}</span>
            </button>
            <button
              onClick={() => onCheckout('debt')}
              disabled={items.length === 0}
              className={cn(
                'flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all',
                'border-border hover:border-primary/50',
                'disabled:opacity-50 disabled:pointer-events-none'
              )}
            >
              <CreditCard className="w-6 h-6 text-green-500" />
              <span className="text-xs font-medium">{t('payment.credit')}</span>
            </button>
          </div>
          <Button variant="outline" className="w-full" onClick={onClearCart} disabled={items.length === 0}>
            <Trash2 className="w-4 h-4 me-2" />
            {t('pos.clear')}
          </Button>
        </div>
      </div>
    </div>
  );
};
