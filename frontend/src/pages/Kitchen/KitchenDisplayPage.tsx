// frontend/src/pages/Kitchen/KitchenDisplayPage.tsx

import React, { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChefHat, RefreshCw } from 'lucide-react';
import { useKitchenOrders } from '@/hooks/useKitchenOrders';
import { Skeleton } from '@/components/ui/skeleton';
import { KitchenStats } from './KitchenStats';
import { KitchenOrderCard } from './KitchenOrderCard';
import { OrderStatus } from '@/api/kitchenService';

const KitchenDisplayPage: React.FC = () => {
  const { orders, isLoading, isUpdatingStatus, changeStatus, refetch } = useKitchenOrders();
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    if (filter === 'all') return orders.filter(o => o.status !== 'served');
    return orders.filter(o => o.status === filter);
  }, [orders, filter]);

  const filters: { label: string; value: OrderStatus | 'all' }[] = [
    { label: 'الكل', value: 'all' },
    { label: 'قيد الانتظار', value: 'pending' },
    { label: 'قيد التحضير', value: 'preparing' },
    { label: 'جاهز', value: 'ready' },
  ];

  if (isLoading && orders.length === 0) {
    return (
      <div className="p-6 bg-background min-h-screen">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-80 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-background min-h-screen">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3"><ChefHat className="w-8 h-8" />شاشة المطبخ</h1>
        <button onClick={() => refetch()} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border text-sm font-medium hover:bg-muted transition-colors">
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />تحديث
        </button>
      </header>
      <KitchenStats orders={orders} />
      <div className="flex gap-2 border-b border-border py-4 my-4">
        {filters.map((f) => (
          <button key={f.value} onClick={() => setFilter(f.value)} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${filter === f.value ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}`}>
            {f.label}
          </button>
        ))}
      </div>
      <main>
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground"><ChefHat className="w-16 h-16 mx-auto mb-4 opacity-20" /><p>لا توجد طلبات حالياً</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {filteredOrders.map((order) => (
                <KitchenOrderCard key={order.id} order={order} onChangeStatus={(orderId, status) => changeStatus({ orderId, status })} isUpdating={isUpdatingStatus} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
};

export default KitchenDisplayPage;
