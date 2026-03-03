import { apiClient } from './apiClient';

// ✅ الواجهة تبقى كما هي، لأنها تطابق ما يرسله الخادم
export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  unit: string;
  currentQty: number;
  minQty: number;
  costPerUnit: number;
}

/**
 * ✅ [تعديل] جلب أصناف المخزون من الـ API الحقيقي
 * 
 * @param params - كائن يحتوي على فلتر البحث
 * @returns مصفوفة من أصناف المخزون
 */
export const fetchInventoryItems = async (params?: { search?: string }): Promise<InventoryItem[]> => {
  console.log("API: Fetching inventory items from server with params:", params);
  try {
    // استدعاء الـ API الحقيقي باستخدام apiClient
    const response = await apiClient.get<InventoryItem[]>('/inventory', { params });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch inventory items:", error);
    // في حالة الفشل، نرجع مصفوفة فارغة لمنع انهيار التطبيق
    return []; 
  }
};
