import { secureStorageService } from "./secureStorage.service";

const ACCESS_TOKEN_KEY = "itjobx_access_token";
const REFRESH_TOKEN_KEY = "itjobx_refresh_token";

export const authTokenService = {
  /**
   * Get the saved access token.
   */
  async getAccessToken(): Promise<string | null> {
    return secureStorageService.getToken(ACCESS_TOKEN_KEY);
  },

  /**
   * Save the access token securely.
   */
  async saveAccessToken(token: string): Promise<boolean> {
    return secureStorageService.saveToken(ACCESS_TOKEN_KEY, token);
  },

  /**
   * Get the saved refresh token.
   */
  async getRefreshToken(): Promise<string | null> {
    return secureStorageService.getToken(REFRESH_TOKEN_KEY);
  },

  /**
   * Save the refresh token securely.
   */
  async saveRefreshToken(token: string): Promise<boolean> {
    return secureStorageService.saveToken(REFRESH_TOKEN_KEY, token);
  },

  /**
   * Clear all tokens on logout or session expiry.
   */
  async clearAllTokens(): Promise<void> {
    await secureStorageService.deleteToken(ACCESS_TOKEN_KEY);
    await secureStorageService.deleteToken(REFRESH_TOKEN_KEY);
  }
};
