import React, { useState } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw, PackageSearch } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { InventoryTable } from './InventoryTable';
import { useDebounce } from '@/hooks/useDebounce'; // ✅ [إضافة] استيراد useDebounce

const InventoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // ✅ [إضافة] استخدام useDebounce لتأخير البحث وتحسين الأداء
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // ✅ [تعديل] تمرير قيمة البحث المؤجلة إلى الـ Hook
  const { items, isLoading, refetch } = useInventory(debouncedSearchTerm);

  // ✅ [حذف] لم نعد بحاجة إلى filteredItems لأن الفلترة تتم الآن في الخادم
  // const filteredItems = useMemo(...);

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
    <div className="p-6 space-y-4">
      <header>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3"><PackageSearch className="w-8 h-8" />إدارة المخزون</h1>
        <p className="text-muted-foreground mt-1">تتبع وتعديل كميات المواد الخام.</p>
      </header>
      <div className="flex justify-between items-center">
        <Input 
          placeholder="ابحث عن صنف..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="max-w-sm" 
        />
        <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`ml-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          تحديث
        </Button>
      </div>
      {/* ✅ تمرير البيانات القادمة مباشرة من الـ Hook */}
      <InventoryTable items={items} />
    </div>
  );
};

export default InventoryPage;
