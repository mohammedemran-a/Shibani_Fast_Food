import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './endpoints';

// Users
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: string;
  is_active?: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  is_active?: boolean;
}

// Roles & Permissions
export interface Permission {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  permissions?: Permission[];
  created_at: string;
  updated_at: string;
}

export interface CreateRoleData {
  name: string;
  permissions: string[];
}

export interface UpdateRoleData {
  name?: string;
  permissions?: string[];
}

export const userRoleService = {
  // Users
  getUsers: async () => {
    const response = await apiClient.get(API_ENDPOINTS.USERS.LIST);
    return response.data;
  },

  getUser: async (id: number) => {
    const response = await apiClient.get(API_ENDPOINTS.USERS.SHOW(id));
    return response.data;
  },

  createUser: async (data: CreateUserData) => {
    const response = await apiClient.post(API_ENDPOINTS.USERS.CREATE, data);
    return response.data;
  },

  updateUser: async (id: number, data: UpdateUserData) => {
    const response = await apiClient.put(API_ENDPOINTS.USERS.UPDATE(id), data);
    return response.data;
  },

  deleteUser: async (id: number) => {
    const response = await apiClient.delete(API_ENDPOINTS.USERS.DELETE(id));
    return response.data;
  },

  // Roles
  getRoles: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ROLES.LIST);
    return response.data;
  },

  getRole: async (id: number) => {
    const response = await apiClient.get(API_ENDPOINTS.ROLES.SHOW(id));
    return response.data;
  },

  createRole: async (data: CreateRoleData) => {
    const response = await apiClient.post(API_ENDPOINTS.ROLES.CREATE, data);
    return response.data;
  },

  updateRole: async (id: number, data: UpdateRoleData) => {
    const response = await apiClient.put(API_ENDPOINTS.ROLES.UPDATE(id), data);
    return response.data;
  },

  deleteRole: async (id: number) => {
    const response = await apiClient.delete(API_ENDPOINTS.ROLES.DELETE(id));
    return response.data;
  },

  // Permissions
  getPermissions: async () => {
    const response = await apiClient.get(API_ENDPOINTS.PERMISSIONS.LIST);
    return response.data;
  },
};
