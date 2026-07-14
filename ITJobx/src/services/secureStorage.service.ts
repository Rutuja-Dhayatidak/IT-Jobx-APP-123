import * as Keychain from "react-native-keychain";

// Simple fallback for Jest test runs or environment where native keychain is unavailable
class InMemorySecureStore {
  private store: { [key: string]: string } = {};

  async set(key: string, value: string): Promise<boolean> {
    this.store[key] = value;
    return true;
  }

  async get(key: string): Promise<string | null> {
    return this.store[key] || null;
  }

  async remove(key: string): Promise<boolean> {
    delete this.store[key];
    return true;
  }
}

const fallbackStore = new InMemorySecureStore();

export const secureStorageService = {
  /**
   * Saves a token securely under a specific service name.
   */
  async saveToken(service: string, token: string): Promise<boolean> {
    try {
      await Keychain.setGenericPassword("token", token, { service });
      return true;
    } catch (error) {
      console.warn("Keychain setGenericPassword failed. Using fallback store:", error);
      return fallbackStore.set(service, token);
    }
  },

  /**
   * Retrieves a token securely.
   */
  async getToken(service: string): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({ service });
      if (credentials) {
        return credentials.password;
      }
      return null;
    } catch (error) {
      console.warn("Keychain getGenericPassword failed. Using fallback store:", error);
      return fallbackStore.get(service);
    }
  },

  /**
   * Clears a stored token.
   */
  async deleteToken(service: string): Promise<boolean> {
    try {
      await Keychain.resetGenericPassword({ service });
      return true;
    } catch (error) {
      console.warn("Keychain resetGenericPassword failed. Using fallback store:", error);
      return fallbackStore.remove(service);
    }
  }
};
