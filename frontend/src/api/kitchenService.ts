// frontend/src/api/kitchenService.ts

// 1. تعريف الأنواع الجديدة والمفصلة
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served';
export type OrderType = 'dine_in' | 'takeaway';

export interface KitchenOrderItem {
  id: number;
  name: string;
  quantity: number;
  notes?: string;
}

export interface KitchenOrder {
  id: string;
  orderNumber: number;
  type: OrderType;
  tableNumber?: number;
  items: KitchenOrderItem[];
  status: OrderStatus;
  createdAt: string;
  notes?: string;
}

// 2. تحديث البيانات الوهمية
const mockOrders: KitchenOrder[] = [
  { id: 'ORD-001', orderNumber: 1, type: 'dine_in', tableNumber: 3, items: [{ id: 1, name: 'برجر لحم', quantity: 2, notes: 'بدون بصل' }, { id: 2, name: 'بطاطس مقلية', quantity: 2 }], status: 'pending', createdAt: new Date(Date.now() - 5 * 60000).toISOString(), notes: 'عميل VIP' },
  { id: 'ORD-002', orderNumber: 2, type: 'takeaway', items: [{ id: 4, name: 'شاورما دجاج', quantity: 3 }], status: 'preparing', createdAt: new Date(Date.now() - 12 * 60000).toISOString() },
  { id: 'ORD-003', orderNumber: 3, type: 'dine_in', tableNumber: 7, items: [{ id: 6, name: 'بروستد دجاج', quantity: 1 }, { id: 8, name: 'سلطة', quantity: 1 }], status: 'ready', createdAt: new Date(Date.now() - 20 * 60000).toISOString() },
  { id: 'ORD-004', orderNumber: 4, type: 'takeaway', items: [{ id: 9, name: 'فلافل', quantity: 5 }], status: 'pending', createdAt: new Date(Date.now() - 2 * 60000).toISOString(), notes: 'مستعجل' },
];

// 3. دوال API الوهمية
export const fetchKitchenOrders = async (): Promise<KitchenOrder[]> => {
  console.log("API: Fetching kitchen orders...");
  return new Promise((resolve) => setTimeout(() => resolve([...mockOrders]), 300));
};

export const updateOrderStatus = async ({ orderId, status }: { orderId: string; status: OrderStatus }): Promise<KitchenOrder> => {
  console.log(`API: Updating order ${orderId} to ${status}`);
  const order = mockOrders.find((o) => o.id === orderId);
  if (!order) throw new Error("Order not found");
  order.status = status;
  return new Promise((resolve) => setTimeout(() => resolve({ ...order }), 200));
};
