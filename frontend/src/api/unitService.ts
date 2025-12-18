import apiClient from './apiClient';
import { UNITS_ENDPOINTS } from './endpoints';

export interface Unit {
  id: number;
  name: string;
  name_ar: string;
  abbreviation: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUnitRequest {
  name: string;
  name_ar: string;
  abbreviation: string;
}

export interface UpdateUnitRequest extends CreateUnitRequest {}

export const unitService = {
  // Get all units
  getAll: async (params?: any) => {
    const response = await apiClient.get(UNITS_ENDPOINTS.LIST, { params });
    return response.data;
  },

  // Get single unit
  getById: async (id: number) => {
    const response = await apiClient.get(UNITS_ENDPOINTS.GET(id));
    return response.data;
  },

  // Create unit
  create: async (data: CreateUnitRequest) => {
    const response = await apiClient.post(UNITS_ENDPOINTS.CREATE, data);
    return response.data;
  },

  // Update unit
  update: async (id: number, data: UpdateUnitRequest) => {
    const response = await apiClient.put(UNITS_ENDPOINTS.UPDATE(id), data);
    return response.data;
  },

  // Delete unit
  delete: async (id: number) => {
    const response = await apiClient.delete(UNITS_ENDPOINTS.DELETE(id));
    return response.data;
  },
};
