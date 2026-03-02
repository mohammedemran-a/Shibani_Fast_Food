// frontend/src/api/tableService.ts

// 1. تعريف النوع الرئيسي للبيانات
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';

export interface RestaurantTable {
  id: number;
  number: number; // رقم الطاولة
  seats: number; // عدد المقاعد
  status: TableStatus;
  customerName?: string;
  occupiedSince?: string; // تاريخ بدء الإشغال
  totalAmount?: number;
}

// 2. تحديث البيانات الوهمية
const mockTables: RestaurantTable[] = [
  { id: 1, number: 1, seats: 2, status: 'occupied', customerName: 'عميل', occupiedSince: new Date(Date.now() - 25 * 60000).toISOString(), totalAmount: 45 },
  { id: 2, number: 2, seats: 4, status: 'available' },
  { id: 3, number: 3, seats: 4, status: 'occupied', customerName: 'أحمد', occupiedSince: new Date(Date.now() - 40 * 60000).toISOString(), totalAmount: 78 },
  { id: 4, number: 4, seats: 6, status: 'available' },
  { id: 5, number: 5, seats: 2, status: 'reserved', customerName: 'خالد' },
  { id: 6, number: 6, seats: 4, status: 'cleaning' },
  { id: 7, number: 7, seats: 6, status: 'occupied', customerName: 'فهد', occupiedSince: new Date(Date.now() - 60 * 60000).toISOString(), totalAmount: 120 },
  { id: 8, number: 8, seats: 4, status: 'available' },
  { id: 9, number: 9, seats: 2, status: 'reserved', customerName: 'سعد' },
  { id: 10, number: 10, seats: 8, status: 'available' },
  { id: 11, number: 11, seats: 4, status: 'cleaning' },
  { id: 12, number: 12, seats: 6, status: 'available' },
];

// 3. دوال API الوهمية
export const fetchTables = async (): Promise<RestaurantTable[]> => {
  console.log("API: Fetching tables...");
  // في المستقبل: return (await apiClient.get('/tables')).data;
  return new Promise((resolve) => setTimeout(() => resolve([...mockTables]), 300));
};

export const updateTableStatus = async ({ tableId, status }: { tableId: number; status: TableStatus }): Promise<RestaurantTable> => {
  console.log(`API: Updating table ${tableId} to ${status}`);
  // في المستقبل: return (await apiClient.patch(`/tables/${tableId}`, { status })).data;
  const table = mockTables.find((t) => t.id === tableId);
  if (!table) throw new Error("Table not found");
  
  table.status = status;
  // منطق تنظيف البيانات عند إتاحة الطاولة
  if (status === 'available') {
    table.customerName = undefined;
    table.occupiedSince = undefined;
    table.totalAmount = undefined;
  }
  return new Promise((resolve) => setTimeout(() => resolve({ ...table }), 200));
};
