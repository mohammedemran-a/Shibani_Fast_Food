import { apiClient } from './apiClient';
import { CATEGORIES_ENDPOINTS, BRANDS_ENDPOINTS, UNITS_ENDPOINTS, CURRENCIES_ENDPOINTS, SALES_INVOICES_ENDPOINTS, PURCHASE_INVOICES_ENDPOINTS, SUPPLIERS_ENDPOINTS, DEBTS_ENDPOINTS, EXPENSES_ENDPOINTS, USERS_ENDPOINTS, ROLES_ENDPOINTS, REPORTS_ENDPOINTS } from './endpoints';

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
    const response = await apiClient.get(USERS_ENDPOINTS.LIST);
    return response.data;
  },

  getUser: async (id: number) => {
    const response = await apiClient.get(USERS_ENDPOINTS.SHOW(id));
    return response.data;
  },

  createUser: async (data: CreateUserData) => {
    const response = await apiClient.post(USERS_ENDPOINTS.CREATE, data);
    return response.data;
  },

  updateUser: async (id: number, data: UpdateUserData) => {
    const response = await apiClient.put(USERS_ENDPOINTS.UPDATE(id), data);
    return response.data;
  },

  deleteUser: async (id: number) => {
    const response = await apiClient.delete(USERS_ENDPOINTS.DELETE(id));
    return response.data;
  },

  // Roles
  getRoles: async () => {
    const response = await apiClient.get(ROLES_ENDPOINTS.LIST);
    return response.data;
  },

  getRole: async (id: number) => {
    const response = await apiClient.get(ROLES_ENDPOINTS.SHOW(id));
    return response.data;
  },

  createRole: async (data: CreateRoleData) => {
    const response = await apiClient.post(ROLES_ENDPOINTS.CREATE, data);
    return response.data;
  },

  updateRole: async (id: number, data: UpdateRoleData) => {
    const response = await apiClient.put(ROLES_ENDPOINTS.UPDATE(id), data);
    return response.data;
  },

  deleteRole: async (id: number) => {
    const response = await apiClient.delete(ROLES_ENDPOINTS.DELETE(id));
    return response.data;
  },

  // Permissions
  getPermissions: async () => {
    const response = await apiClient.get(ROLES_ENDPOINTS.LIST);
    return response.data;
  },
};
