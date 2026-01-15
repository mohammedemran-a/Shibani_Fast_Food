import { apiClient } from './apiClient';

export interface Profile {
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

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface ProfileResponse {
  success: boolean;
  message?: string;
  data: Profile;
}

export interface MessageResponse {
  success: boolean;
  message: string;
}

export const profileService = {
  /**
   * Get user profile
   */
  async getProfile(): Promise<ProfileResponse> {
    const response = await apiClient.get('/profile');
    return response.data;
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<ProfileResponse> {
    const response = await apiClient.put('/profile', data);
    return response.data;
  },

  /**
   * Update user avatar
   */
  async updateAvatar(file: File): Promise<ProfileResponse> {
    const formData = new FormData();
    formData.append('avatar', file);

    // Don't set Content-Type header - let axios handle it automatically
    const response = await apiClient.post('/profile/avatar', formData);
    return response.data;
  }

  /**
   * Delete user avatar
   */
  async deleteAvatar(): Promise<MessageResponse> {
    const response = await apiClient.delete('/profile/avatar');
    return response.data;
  },

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordData): Promise<MessageResponse> {
    const response = await apiClient.post('/profile/change-password', data);
    return response.data;
  },
};
