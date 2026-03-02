// frontend/src/api/inventoryService.ts

export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  unit: string;
  currentQty: number;
  minQty: number;
  costPerUnit: number;
}

const mockItems: InventoryItem[] = [
  { id: 1, name: 'لحم بقري', category: 'لحوم', unit: 'كجم', currentQty: 25, minQty: 10, costPerUnit: 45 },
  { id: 2, name: 'دجاج', category: 'لحوم', unit: 'كجم', currentQty: 40, minQty: 15, costPerUnit: 20 },
  { id: 3, name: 'خبز برجر', category: 'مخبوزات', unit: 'حزمة', currentQty: 8, minQty: 10, costPerUnit: 5 },
  { id: 4, name: 'جبنة شيدر', category: 'ألبان', unit: 'كجم', currentQty: 12, minQty: 5, costPerUnit: 30 },
  { id: 5, name: 'بطاطس', category: 'خضروات', unit: 'كجم', currentQty: 50, minQty: 20, costPerUnit: 3 },
  { id: 6, name: 'طماطم', category: 'خضروات', unit: 'كجم', currentQty: 15, minQty: 10, costPerUnit: 4 },
  { id: 7, name: 'مشروبات غازية', category: 'مشروبات', unit: 'كرتون', currentQty: 3, minQty: 5, costPerUnit: 25 },
];

export const fetchInventoryItems = async (): Promise<InventoryItem[]> => {
  console.log("API: Fetching inventory items...");
  return new Promise((resolve) => setTimeout(() => resolve([...mockItems]), 500));
};

export const adjustStock = async ({ itemId, quantity, reason }: { itemId: number; quantity: number; reason: string }): Promise<InventoryItem> => {
  console.log(`API: Adjusting stock for item ${itemId} by ${quantity} for reason: ${reason}`);
  const item = mockItems.find((i) => i.id === itemId);
  if (!item) throw new Error("Item not found");
  item.currentQty += quantity; // Quantity can be positive (add) or negative (deduct)
  return new Promise((resolve) => setTimeout(() => resolve({ ...item }), 200));
};
