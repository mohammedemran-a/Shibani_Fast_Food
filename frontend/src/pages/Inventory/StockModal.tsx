// frontend/src/pages/Inventory/StockModal.tsx

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { InventoryItem } from '@/api/inventoryService';
import { toast } from 'sonner';

interface StockModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  type: 'add' | 'deduct';
  onConfirm: (quantity: number, reason: string) => void;
  isConfirming: boolean;
}

export const StockModal: React.FC<StockModalProps> = ({ isOpen, onClose, item, type, onConfirm, isConfirming }) => {
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setQuantity('');
      setReason('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    const qty = parseInt(quantity);
    if (qty > 0 && reason.trim()) {
      onConfirm(type === 'add' ? qty : -qty, reason);
    } else {
      toast.warning('يرجى إدخال الكمية والسبب.');
    }
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === 'add' ? 'إضافة مخزون لـ: ' : 'خصم مخزون من: '}
            <span className="font-bold text-primary">{item.name}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">الكمية</Label>
            <Input id="quantity" type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">السبب</Label>
            <Input id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="مثال: شراء جديد، تالف، استهلاك..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
          <Button onClick={handleConfirm} disabled={isConfirming}>
            {isConfirming ? 'جاري التأكيد...' : 'تأكيد'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
