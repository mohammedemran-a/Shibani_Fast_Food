// frontend/src/pages/Kitchen/KitchenStats.tsx

import React from 'react';
import { Clock, ChefHat, CheckCircle2, ClipboardList } from 'lucide-react';
import { KitchenOrder } from '@/api/kitchenService';

interface KitchenStatsProps {
  orders: KitchenOrder[];
}

export const KitchenStats: React.FC<KitchenStatsProps> = ({ orders }) => {
  const stats = {
    pending: orders.filter((o) => o.status === 'pending').length,
    preparing: orders.filter((o) => o.status === 'preparing').length,
    ready: orders.filter((o) => o.status === 'ready').length,
    total: orders.length,
  };

  const items = [
    { label: 'قيد الانتظار', value: stats.pending, icon: Clock, color: 'text-warning bg-warning/10' },
    { label: 'قيد التحضير', value: stats.preparing, icon: ChefHat, color: 'text-primary bg-primary/10' },
    { label: 'جاهز', value: stats.ready, icon: CheckCircle2, color: 'text-success bg-success/10' },
    { label: 'إجمالي الطلبات', value: stats.total, icon: ClipboardList, color: 'text-foreground bg-muted' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((item) => (
        <div key={item.label} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color}`}>
            <item.icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{item.value}</p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
