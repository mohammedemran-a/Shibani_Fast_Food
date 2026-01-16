import { apiClient } from './apiClient';
import { ROLES_ENDPOINTS } from './endpoints';

export interface Permission {
  id: number;
  name: string;
  name_ar: string;
  module: string;
  description?: string;
}

export interface Role {
  id: number;
  name: string;
  name_ar: string;
  description?: string;
  permissions: Permission[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateRoleData {
  name: string;
  name_ar?: string;
  description?: string;
  permissions?: number[];
}

export interface UpdateRoleData {
  name?: string;
  name_ar?: string;
  description?: string;
  permissions?: number[];
}

export interface RolesResponse {
  success: boolean;
  data: Role[];
}

export interface RoleResponse {
  success: boolean;
  message?: string;
  data: Role;
}

export interface PermissionsResponse {
  success: boolean;
  data: Permission[];
}

export const roleService = {
  /**
   * Get all roles
   */
  async getAll(): Promise<RolesResponse> {
    try {
      const response = await apiClient.get(ROLES_ENDPOINTS.LIST);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get role by ID
   */
  async getById(id: number): Promise<RoleResponse> {
    try {
      const response = await apiClient.get(ROLES_ENDPOINTS.GET(id));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new role
   */
  async create(data: CreateRoleData): Promise<RoleResponse> {
    try {
      const response = await apiClient.post(ROLES_ENDPOINTS.CREATE, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update role
   */
  async update(id: number, data: UpdateRoleData): Promise<RoleResponse> {
    try {
      const response = await apiClient.put(ROLES_ENDPOINTS.UPDATE(id), data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete role
   */
  async delete(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete(ROLES_ENDPOINTS.DELETE(id));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all permissions
   */
  async getAllPermissions(): Promise<PermissionsResponse> {
    try {
      const response = await apiClient.get('/permissions');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update permissions for a role
   */
  async updatePermissions(id: number, permissions: number[]): Promise<RoleResponse> {
    try {
      const response = await apiClient.post(ROLES_ENDPOINTS.UPDATE_PERMISSIONS(id), { permissions });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
