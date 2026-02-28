// src/components/pos/CartSection.tsx

import React, { memo, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, Banknote, CreditCard, Wallet, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api/apiClient';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useCart } from '@/hooks/useCart';
import { CustomerSearch } from './CustomerSearch';
import { Customer, PosProduct, CartItem, SellableUnit } from '@/types'; 

const CartItemRow: React.FC<{ item: CartItem }> = memo(({ item }) => {
    const { updateQuantity, removeFromCart, changeUnit } = useCart.getState();
    const [isUnitSwitcherOpen, setIsUnitSwitcherOpen] = useState(false);

    const { data: product, isLoading } = useQuery<PosProduct>({
        queryKey: ['pos_product_units', item.product_id],
        queryFn: async () => {
            const response = await apiClient.get(`/products/${item.product_id}?pos=true`);
            return response.data.data;
        },
        enabled: isUnitSwitcherOpen,
        staleTime: 5 * 60 * 1000,
    });

    const handleUnitSelect = (selectedUnit: SellableUnit) => {
        changeUnit(item.barcode_id, selectedUnit);
        setIsUnitSwitcherOpen(false);
    };

    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
            >
                <img src={item.image_url || '/no-image.svg'} alt={item.product_name} className="w-12 h-12 rounded-lg object-cover bg-muted flex-shrink-0" />
                
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{item.product_name}</p>
                    <Button 
                        variant="link" 
                        className="h-auto p-0 text-primary text-xs"
                        onClick={() => setIsUnitSwitcherOpen(true)}
                    >
                        {item.unit_name}
                        <ChevronsUpDown className="w-3 h-3 ms-1" />
                    </Button>
                </div>

                <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.barcode_id, item.quantity - 1)}><Minus className="w-3 h-3" /></Button>
                    <span className="w-6 text-center font-medium text-sm">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.barcode_id, item.quantity + 1)}><Plus className="w-3 h-3" /></Button>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/70 hover:text-destructive" onClick={() => removeFromCart(item.barcode_id)}><Trash2 className="w-4 h-4" /></Button>
            </motion.div>

            <Dialog open={isUnitSwitcherOpen} onOpenChange={setIsUnitSwitcherOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>تغيير الوحدة</DialogTitle>
                        <DialogDescription>اختر الوحدة الجديدة للمنتج "{item.product_name}".</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-2">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-24"><Loader2 className="w-6 h-6 animate-spin" /></div>
                        ) : (
                            // ✅ =================================================
                            // ✅ التصحيح الجذري والنهائي
                            // ✅ التأكد من وجود product و product.sellable_units قبل استدعاء map
                            // ✅ =================================================
                            product?.sellable_units?.map(unit => (
                                <Button
                                    key={unit.barcode_id}
                                    variant={unit.barcode_id === item.barcode_id ? 'default' : 'outline'}
                                    className="w-full justify-between h-12 text-base"
                                    onClick={() => handleUnitSelect(unit)}
                                >
                                    <span>{unit.unit_name}</span>
                                    <span className="font-bold">${unit.selling_price.toFixed(2)}</span>
                                </Button>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
});

// ... (بقية كود CartSection يبقى كما هو دون تغيير)
interface CartSectionProps {
    onCheckout: (method: 'cash' | 'wallet' | 'debt') => void;
    selectedCustomer: Customer | null;
    onSelectCustomer: (customer: Customer | null) => void;
    focusCustomerSearch: number;
}

export const CartSection: React.FC<CartSectionProps> = memo(({ onCheckout, selectedCustomer, onSelectCustomer, focusCustomerSearch }) => {
    const items = useCart(state => state.items);
    const subtotal = useCart(state => state.subtotal);
    const { clearCart } = useCart.getState();

    const { tax, total } = useMemo(() => {
        const taxRate = 0.15;
        const taxAmount = subtotal * taxRate;
        return { tax: taxAmount, total: subtotal + taxAmount };
    }, [subtotal]);

    return (
        <div className="flex flex-col h-full bg-card rounded-2xl border overflow-hidden">
            <div className="p-4 border-b">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                    سلة المبيعات
                </h3>
            </div>
            
            <CustomerSearch 
                selectedCustomer={selectedCustomer} 
                onSelectCustomer={onSelectCustomer} 
                focusTrigger={focusCustomerSearch}
            />

            <div className="flex-1 overflow-y-auto p-2">
                <AnimatePresence>
                    {items.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <ShoppingBag className="w-12 h-12 mb-2 opacity-50" />
                            <p>السلة فارغة</p>
                        </motion.div>
                    ) : (
                        items.map((item) => <CartItemRow key={item.barcode_id} item={item} />)
                    )}
                </AnimatePresence>
            </div>

            <div className="p-4 mt-auto border-t space-y-4 bg-muted/30">
                <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span>المجموع الفرعي</span><span>${subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>الضريبة (15%)</span><span>${tax.toFixed(2)}</span></div>
                    <div className="flex justify-between text-lg font-bold pt-1 border-t mt-1"><span>الإجمالي</span><span className="text-primary">${total.toFixed(2)}</span></div>
                </div>
                <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                        <Button onClick={() => onCheckout('cash')} disabled={items.length === 0} className="flex-col h-16"><Banknote className="w-6 h-6 mb-1" /><span>نقدي</span></Button>
                        <Button onClick={() => onCheckout('wallet')} disabled={items.length === 0} className="flex-col h-16"><Wallet className="w-6 h-6 mb-1" /><span>محفظة</span></Button>
                        <Button onClick={() => onCheckout('debt')} disabled={items.length === 0} className="flex-col h-16"><CreditCard className="w-6 h-6 mb-1" /><span>دين</span></Button>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => { clearCart(); onSelectCustomer(null); }} disabled={items.length === 0}>
                        <Trash2 className="w-4 h-4 me-2" />
                        تفريغ السلة
                    </Button>
                </div>
            </div>
        </div>
    );
});
