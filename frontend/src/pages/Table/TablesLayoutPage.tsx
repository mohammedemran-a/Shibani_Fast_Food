// frontend/src/pages/Table/TablesLayoutPage.tsx

import React, { useState, useMemo } from 'react';
import { useTables } from '@/hooks/useTables';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { TableCard } from './TableCard';
import { TableStatus } from '@/api/tableService';

const StatusFilter = ({ title, count, active, onClick }: { title: string, count: number, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`p-3 rounded-lg border-2 text-right w-full transition-all ${
      active ? 'bg-primary border-primary/80 text-primary-foreground' : 'bg-card border-border hover:border-primary/50'
    }`}
  >
    <p className="text-2xl font-bold">{count}</p>
    <p className="text-sm font-semibold">{title}</p>
  </button>
);

const TablesLayoutPage: React.FC = () => {
  // 1. إزالة استدعاء useTranslation
  const { tables, isLoading, isUpdatingStatus, changeStatus, refetch } = useTables();
  const [activeFilter, setActiveFilter] = useState<TableStatus | 'all'>('all');

  const stats = useMemo(() => ({
    all: tables.length,
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
    cleaning: tables.filter(t => t.status === 'cleaning').length,
  }), [tables]);

  const filteredTables = useMemo(() => {
    if (activeFilter === 'all') return tables;
    return tables.filter(t => t.status === activeFilter);
  }, [tables, activeFilter]);

  const handleOpenOrder = (tableNumber: number) => {
    console.log(`Opening new order for table ${tableNumber}`);
  };

  if (isLoading && tables.length === 0) {
    return (
        <div className="p-6 md:p-8 bg-background min-h-screen">
            <Skeleton className="h-10 w-64 mb-6" />
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
                {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-[250px] w-full" />)}
            </div>
        </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-background min-h-screen font-sans">
      <header className="flex justify-between items-center mb-6">
        <div>
          {/* 2. استخدام النصوص العربية مباشرة */}
          <h1 className="text-3xl font-bold text-foreground">إدارة الطاولات</h1>
          <p className="text-md text-muted-foreground mt-1">عرض ومتابعة حالة الطاولات</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`ml-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          تحديث
        </Button>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatusFilter title="الكل" count={stats.all} active={activeFilter === 'all'} onClick={() => setActiveFilter('all')} />
        <StatusFilter title="متاحة" count={stats.available} active={activeFilter === 'available'} onClick={() => setActiveFilter('available')} />
        <StatusFilter title="مشغولة" count={stats.occupied} active={activeFilter === 'occupied'} onClick={() => setActiveFilter('occupied')} />
        <StatusFilter title="محجوزة" count={stats.reserved} active={activeFilter === 'reserved'} onClick={() => setActiveFilter('reserved')} />
        <StatusFilter title="تنظيف" count={stats.cleaning} active={activeFilter === 'cleaning'} onClick={() => setActiveFilter('cleaning')} />
      </div>

      <main>
        {filteredTables.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
            {filteredTables.map((table) => (
              <TableCard
                key={table.id}
                table={table}
                onChangeStatus={(tableId, status) => changeStatus({ tableId, status })}
                onOpenOrder={handleOpenOrder}
                isUpdating={isUpdatingStatus}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p>لا توجد طاولات بهذه الحالة.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default TablesLayoutPage;
