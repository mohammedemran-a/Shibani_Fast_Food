// frontend/src/pages/Inventory/InventoryPage.tsx

import React, { useState, useMemo } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw, PackageSearch } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { InventoryTable } from './InventoryTable';
import { StockModal } from './StockModal';
import { InventoryItem } from '@/api/inventoryService';

const InventoryPage: React.FC = () => {
  const { items, isLoading, isAdjusting, adjustStock, refetch } = useInventory();
  const [search, setSearch] = useState('');
  const [modalState, setModalState] = useState<{ isOpen: boolean; item: InventoryItem | null; type: 'add' | 'deduct' }>({ isOpen: false, item: null, type: 'add' });

  const filteredItems = useMemo(() => {
    if (!search) return items;
    return items.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
  }, [items, search]);

  const handleOpenModal = (item: InventoryItem, type: 'add' | 'deduct') => {
    setModalState({ isOpen: true, item, type });
  };

  const handleConfirmStockChange = (quantity: number, reason: string) => {
    if (modalState.item) {
      adjustStock({ itemId: modalState.item.id, quantity, reason }, {
        onSuccess: () => setModalState({ isOpen: false, item: null, type: 'add' }),
      });
    }
  };

  if (isLoading && items.length === 0) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <>
      <div className="p-6 space-y-4">
        <header>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3"><PackageSearch className="w-8 h-8" />إدارة المخزون</h1>
          <p className="text-muted-foreground mt-1">تتبع وتعديل كميات المواد الخام.</p>
        </header>
        <div className="flex justify-between items-center">
          <Input placeholder="ابحث عن صنف..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}><RefreshCw className={`ml-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />تحديث</Button>
        </div>
        <InventoryTable items={filteredItems} onAdjustStock={handleOpenModal} />
      </div>
      <StockModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, item: null, type: 'add' })}
        item={modalState.item}
        type={modalState.type}
        onConfirm={handleConfirmStockChange}
        isConfirming={isAdjusting}
      />
    </>
  );
};

export default InventoryPage;
