// frontend/src/pages/Inventory/InventoryTable.tsx

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { InventoryItem } from '@/api/inventoryService';

interface InventoryTableProps {
  items: InventoryItem[];
}

export const InventoryTable: React.FC<InventoryTableProps> = ({ items }) => {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>اسم الصنف</TableHead>
            <TableHead>الفئة</TableHead>
            <TableHead>الوحدة</TableHead>
            <TableHead>الكمية الحالية</TableHead>
            <TableHead>حد أدنى</TableHead>
            <TableHead>تكلفة الوحدة</TableHead>
            <TableHead>الحالة</TableHead>
            {/* ✅ تم حذف عمود "إجراءات" من هنا */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const isLow = item.currentQty <= item.minQty;
            const isOut = item.currentQty === 0;
            return (
              <TableRow key={item.id} className={cn(isLow && !isOut && 'bg-warning/5', isOut && 'bg-destructive/5')}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell><span className={cn('font-bold', (isLow || isOut) && 'text-destructive')}>{item.currentQty}</span></TableCell>
                <TableCell>{item.minQty}</TableCell>
                <TableCell>${item.costPerUnit.toFixed(2)}</TableCell>
                <TableCell>
                  {isOut ? <Badge variant="destructive" className="gap-1"><AlertTriangle className="w-3 h-3" />نفذ</Badge>
                   : isLow ? <Badge variant="outline" className="text-warning border-warning gap-1"><AlertTriangle className="w-3 h-3" />منخفض</Badge>
                   : <Badge variant="secondary">متوفر</Badge>}
                </TableCell>
                {/* ✅ تم حذف خلية الأزرار من هنا */}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
