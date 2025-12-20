import apiClient from './apiClient';
import { AUTH_ENDPOINTS } from './endpoints';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  role: string;
  role_ar: string;
  permissions: string[];
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user?: User;
    token?: string;
  };
}

class AuthService {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>(
        AUTH_ENDPOINTS.LOGIN,
        credentials
      );

      if (response.data.data.token) {
        localStorage.setItem('auth_token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        AUTH_ENDPOINTS.LOGOUT
      );

      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');

      return response.data;
    } catch (error) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      throw error;
    }
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const response = await apiClient.get<AuthResponse>(AUTH_ENDPOINTS.ME);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  /**
   * Get stored user data
   */
  getUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  /**
   * Get auth token
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Check if user has permission
   */
  hasPermission(permission: string): boolean {
    const user = this.getUser();
    return user ? user.permissions.includes(permission) : false;
  }

  /**
   * Check if user has role
   */
  hasRole(role: string): boolean {
    const user = this.getUser();
    return user ? user.role === role : false;
  }
}

const authService = new AuthService();

export { authService };
