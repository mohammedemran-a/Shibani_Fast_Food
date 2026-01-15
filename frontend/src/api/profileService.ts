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

// Add debug logging for API responses
if (typeof window !== 'undefined') {
  (window as any).__profileServiceDebug = true;
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
    console.log('Fetching user profile');
    const response = await apiClient.get('/profile');
    console.log('Profile fetched successfully:', response.data);
    return response.data;
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<ProfileResponse> {
    console.log('Updating profile with data:', data);
    const response = await apiClient.put('/profile', data);
    return response.data;
  },

  /**
   * Update user avatar
   */
  async updateAvatar(file: File): Promise<ProfileResponse> {
    const formData = new FormData();
    
    // Log FormData contents for debugging
    console.log('Avatar file details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
    });
    
    // Try different field names that the backend might expect
    formData.append('avatar', file, file.name);
    formData.append('image', file, file.name);
    formData.append('photo', file, file.name);
    
    // Log FormData entries
    console.log('FormData entries:');
    formData.forEach((value, key) => {
      console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
    });

    try {
      // Try POST first
      console.log('Attempting POST to /profile/avatar');
      const response = await apiClient.post('/profile/avatar', formData);
      return response.data;
    } catch (postError: any) {
      console.error('POST failed:', postError.response?.data || postError.message);
      
      // If POST fails, try PUT as fallback
      try {
        console.log('POST failed, attempting PUT to /profile/avatar');
        const formDataPut = new FormData();
        formDataPut.append('avatar', file, file.name);
        const response = await apiClient.put('/profile/avatar', formDataPut);
        return response.data;
      } catch (putError: any) {
        console.error('PUT also failed:', putError.response?.data || putError.message);
        throw postError; // Throw the original POST error
      }
    }
  },

  /**
   * Delete user avatar
   */
  async deleteAvatar(): Promise<MessageResponse> {
    console.log('Attempting to delete avatar');
    const response = await apiClient.delete('/profile/avatar');
    return response.data;
  },

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordData): Promise<MessageResponse> {
    console.log('Attempting password change');
    const response = await apiClient.post('/profile/change-password', data);
    return response.data;
  },
};
