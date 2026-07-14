import { apiRequest, setToken } from './api';

export interface RegisterData {
  firstName: string;
  lastName?: string;
  email: string;
  password?: string;
  phone?: string;
  confirmPassword?: string;
  termsAccepted?: boolean;
}

export const authService = {
  /**
   * Register a new candidate (sends OTP)
   */
  async register(data: RegisterData) {
    return apiRequest('/candidates/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Verify candidate OTP
   */
  async verifyOtp(email: string, otp: string) {
    const response = await apiRequest('/candidates/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
    
    // Save token if returned
    if (response.token) {
      setToken(response.token);
    }
    
    return response;
  },

  /**
   * Login candidate
   */
  async login(email: string, password: string) {
    const response = await apiRequest('/candidates/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Save token if returned
    if (response.token) {
      setToken(response.token);
    }

    return response;
  },

  /**
   * Get Candidate Profile
   */
  async getProfile() {
    return apiRequest('/candidates/profile', {
      method: 'GET',
    });
  },

  /**
   * Logout user
   */
  logout() {
    setToken(null);
  }
};
