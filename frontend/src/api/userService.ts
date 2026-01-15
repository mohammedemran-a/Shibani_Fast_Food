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
  password_confirmation?: string;
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

// Debug logging
if (typeof window !== 'undefined') {
  (window as any).__userServiceDebug = true;
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
    console.log('Fetching users with params:', params);
    try {
      const response = await apiClient.get('/users', { params });
      console.log('Users fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch users:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get user by ID
   */
  async getById(id: number): Promise<UserResponse> {
    console.log('Fetching user by ID:', id);
    try {
      const response = await apiClient.get(`/users/${id}`);
      console.log('User fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch user:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Create new user
   */
  async create(data: CreateUserData): Promise<UserResponse> {
    console.log('Creating new user with data:', {
      name: data.name,
      email: data.email,
      phone: data.phone,
      role_id: data.role_id,
      is_active: data.is_active,
      password: '***hidden***',
    });
    
    try {
      const response = await apiClient.post('/users', data);
      console.log('User created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to create user:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  /**
   * Update user
   */
  async update(id: number, data: UpdateUserData): Promise<UserResponse> {
    console.log('Updating user:', id, 'with data:', data);
    try {
      const response = await apiClient.put(`/users/${id}`, data);
      console.log('User updated successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to update user:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Delete user
   */
  async delete(id: number): Promise<{ success: boolean; message: string }> {
    console.log('Deleting user:', id);
    try {
      const response = await apiClient.delete(`/users/${id}`);
      console.log('User deleted successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to delete user:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Toggle user active status
   */
  async toggleActive(id: number): Promise<UserResponse> {
    console.log('Toggling user active status:', id);
    try {
      const response = await apiClient.post(`/users/${id}/toggle-active`);
      console.log('User status toggled successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to toggle user status:', error.response?.data || error.message);
      throw error;
    }
  },
};
