// frontend/src/pages/Kitchen/KitchenOrderCard.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ChefHat, CheckCircle2, UtensilsCrossed, Package, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { KitchenOrder, OrderStatus } from '@/api/kitchenService';

interface KitchenOrderCardProps {
  order: KitchenOrder;
  onChangeStatus: (orderId: string, status: OrderStatus) => void;
  isUpdating: boolean;
}

const statusConfig: Record<OrderStatus, { icon: React.ElementType; colorClass: string; label: string }> = {
  pending: { icon: Clock, colorClass: 'bg-warning/10 text-warning border-warning/30', label: 'قيد الانتظار' },
  preparing: { icon: ChefHat, colorClass: 'bg-primary/10 text-primary border-primary/30', label: 'قيد التحضير' },
  ready: { icon: CheckCircle2, colorClass: 'bg-success/10 text-success border-success/30', label: 'جاهز' },
  served: { icon: UtensilsCrossed, colorClass: 'bg-muted text-muted-foreground border-border', label: 'تم التسليم' },
};

const nextStatusMap: Record<OrderStatus, OrderStatus | null> = {
  pending: 'preparing',
  preparing: 'ready',
  ready: 'served',
  served: null,
};

const nextStatusLabels: Partial<Record<OrderStatus, string>> = {
  preparing: 'بدء التحضير',
  ready: 'جاهز للتسليم',
  served: 'تم التسليم',
};

export const KitchenOrderCard: React.FC<KitchenOrderCardProps> = ({ order, onChangeStatus, isUpdating }) => {
  const config = statusConfig[order.status];
  const StatusIcon = config.icon;
  const minutesAgo = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);
  const isUrgent = minutesAgo > 15 && order.status !== 'ready' && order.status !== 'served';
  const next = nextStatusMap[order.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-xl border-2 p-4 flex flex-col', config.colorClass, isUrgent && 'animate-pulse-soft ring-2 ring-destructive/50')}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">#{order.orderNumber}</span>
          <Badge variant="outline" className={cn('gap-1', config.colorClass)}><StatusIcon className="w-3 h-3" />{config.label}</Badge>
        </div>
        <Badge variant="secondary" className="gap-1">
          {order.type === 'dine_in' ? <><UtensilsCrossed className="w-3 h-3" />طاولة {order.tableNumber}</> : <><Package className="w-3 h-3" />سفري</>}
        </Badge>
      </div>
      <div className="flex items-center gap-1 text-xs mb-3 opacity-75">
        <Clock className="w-3 h-3" /><span>منذ {minutesAgo} دقيقة</span>
        {isUrgent && <span className="flex items-center gap-1 text-destructive font-medium ms-2"><AlertCircle className="w-3 h-3" />مستعجل</span>}
      </div>
      <div className="space-y-2 mb-4 flex-grow">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-start justify-between bg-background/50 rounded-lg p-2">
            <div className="flex-1"><span className="font-medium text-sm">{item.name}</span>{item.notes && <p className="text-xs text-muted-foreground mt-0.5">📝 {item.notes}</p>}</div>
            <span className="font-bold text-sm bg-background rounded-full w-7 h-7 flex items-center justify-center">{item.quantity}</span>
          </div>
        ))}
      </div>
      {order.notes && <div className="text-xs bg-background/50 rounded-lg p-2 mb-3 border border-border/50">📌 {order.notes}</div>}
      {next && (
        <Button onClick={() => onChangeStatus(order.id, next)} disabled={isUpdating} className="w-full gap-2 mt-auto">
          {next === 'preparing' && <ChefHat className="w-4 h-4" />}
          {next === 'ready' && <CheckCircle2 className="w-4 h-4" />}
          {next === 'served' && <UtensilsCrossed className="w-4 h-4" />}
          {nextStatusLabels[next]}
        </Button>
      )}
    </motion.div>
  );
};
