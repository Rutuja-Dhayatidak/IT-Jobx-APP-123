import { apiRequest } from './api';

export const viewProfileService = {
  /**
   * Fetch candidate profile
   */
  async getProfile() {
    return apiRequest('/profile/me', {
      method: 'GET',
    });
  },

  /**
   * Update candidate profile details
   */
  async updateProfile(profileData: any) {
    return apiRequest('/profile/update', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};
