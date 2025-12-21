import { apiClient } from './apiClient';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role_id: number;
  is_active: boolean;
  role?: {
    id: number;
    name: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role_id: number;
  is_active?: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  role_id?: number;
  is_active?: boolean;
}

export interface UsersResponse {
  success: boolean;
  message?: string;
  data: {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface UserResponse {
  success: boolean;
  message?: string;
  data: User;
}

export const userService = {
  /**
   * Get all users
   */
  async getAll(params?: {
    role_id?: number;
    is_active?: boolean;
    search?: string;
    per_page?: number;
    page?: number;
  }): Promise<UsersResponse> {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },

  /**
   * Get user by ID
   */
  async getById(id: number): Promise<UserResponse> {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  /**
   * Create new user
   */
  async create(data: CreateUserData): Promise<UserResponse> {
    const response = await apiClient.post('/users', data);
    return response.data;
  },

  /**
   * Update user
   */
  async update(id: number, data: UpdateUserData): Promise<UserResponse> {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },

  /**
   * Delete user
   */
  async delete(id: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },

  /**
   * Toggle user active status
   */
  async toggleActive(id: number): Promise<UserResponse> {
    const response = await apiClient.post(`/users/${id}/toggle-active`);
    return response.data;
  },
};
