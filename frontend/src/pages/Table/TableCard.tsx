// frontend/src/pages/Table/TableCard.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, ShoppingCart, Sparkles, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { RestaurantTable, TableStatus } from '@/api/tableService';

interface TableCardProps {
  table: RestaurantTable;
  onChangeStatus: (tableId: number, status: TableStatus) => void;
  onOpenOrder: (tableNumber: number) => void;
  isUpdating: boolean;
}

const statusStyles: Record<TableStatus, string> = {
  available: 'border-success/50 bg-success/5 hover:bg-success/10',
  occupied: 'border-primary/50 bg-primary/5 hover:bg-primary/10',
  reserved: 'border-warning/50 bg-warning/5 hover:bg-warning/10',
  cleaning: 'border-muted-foreground/30 bg-muted/20 hover:bg-muted/30',
};

const statusIcons: Record<TableStatus, React.ElementType> = {
  available: Sparkles,
  occupied: ShoppingCart,
  reserved: Ban,
  cleaning: Sparkles,
};

// 1. قمنا بإضافة النصوص العربية مباشرة هنا
const statusLabels: Record<TableStatus, string> = {
    available: 'متاحة',
    occupied: 'مشغولة',
    reserved: 'محجوزة',
    cleaning: 'تنظيف',
};

export const TableCard: React.FC<TableCardProps> = ({ table, onChangeStatus, onOpenOrder, isUpdating }) => {
  const StatusIcon = statusIcons[table.status];

  const minutesOccupied = table.occupiedSince
    ? Math.floor((Date.now() - new Date(table.occupiedSince).getTime()) / 60000)
    : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'rounded-xl border-2 p-4 flex flex-col h-[250px] transition-all',
        statusStyles[table.status]
      )}
    >
      <div className="text-center mb-2">
        <div className="text-4xl font-bold text-foreground">{table.number}</div>
        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <Users className="w-3 h-3" />
          {table.seats} مقاعد
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 mb-3 text-sm font-medium">
        <StatusIcon className="w-4 h-4" />
        {/* 2. استخدام النصوص العربية مباشرة */}
        <span>{statusLabels[table.status]}</span>
      </div>

      <div className="flex-grow flex flex-col justify-center text-center text-xs mb-3">
        {table.status === 'occupied' && (
          <div className="space-y-1 bg-background/30 rounded-lg p-2">
            {table.customerName && <p className="font-semibold">{table.customerName}</p>}
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <Clock className="w-3 h-3" />
              {minutesOccupied} دقيقة
            </div>
            {table.totalAmount != null && (
              <p className="font-bold text-lg text-primary">${table.totalAmount.toFixed(2)}</p>
            )}
          </div>
        )}
        {table.status === 'reserved' && table.customerName && (
          <p className="font-semibold">{table.customerName}</p>
        )}
      </div>

      <div className="mt-auto space-y-1">
        {table.status === 'available' && (
          <Button size="sm" className="w-full" onClick={() => onOpenOrder(table.number)}>
            طلب جديد
          </Button>
        )}
        {table.status === 'occupied' && (
          <Button size="sm" variant="outline" className="w-full" onClick={() => onChangeStatus(table.id, 'cleaning')} disabled={isUpdating}>
            إغلاق الطاولة
          </Button>
        )}
        {table.status === 'cleaning' && (
          <Button size="sm" variant="secondary" className="w-full" onClick={() => onChangeStatus(table.id, 'available')} disabled={isUpdating}>
            جاهزة
          </Button>
        )}
        {table.status === 'reserved' && (
          <Button size="sm" variant="outline" className="w-full" onClick={() => onOpenOrder(table.number)}>
            استقبال الضيف
          </Button>
        )}
      </div>
    </motion.div>
  );
};
