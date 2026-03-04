import { apiClient } from './apiClient';

export interface InventoryItem {
  id: number;
  name: string;
  unit: string;
  average_cost_per_unit: number;
}

export const inventoryItemService = {
  searchInventoryItems: async (name: string): Promise<InventoryItem[]> => {
    try {
      const response = await apiClient.get('/inventory-items/search', {
        params: { name }
      });
      return response.data; 
    } catch (error) {
      console.error("Error searching inventory items:", error);
      return [];
    }
  },
};
