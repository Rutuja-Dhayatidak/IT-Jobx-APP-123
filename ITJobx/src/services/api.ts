import { Config } from "../config/app.config";
import { authTokenService } from "./authToken.service";

export const BASE_URL = Config.API_BASE_URL;

let authToken: string | null = null;

export const setToken = (token: string | null) => {
  authToken = token;
  if (token) {
    authTokenService.saveAccessToken(token).catch(err => 
      console.warn("Failed to persist access token in secure storage", err)
    );
  } else {
    authTokenService.clearAllTokens().catch(err => 
      console.warn("Failed to clear secure storage tokens", err)
    );
  }
};

export const getToken = async (): Promise<string | null> => {
  if (!authToken) {
    authToken = await authTokenService.getAccessToken();
  }
  return authToken;
};

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  
  const currentToken = await getToken();
  if (currentToken) {
    headers.set("Authorization", `Bearer ${currentToken}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get("content-type");
    
    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    if (!response.ok) {
      if (response.status === 401) {
        // Clear invalid/expired token to trigger redirect to Login screen
        setToken(null);
      }
      const errMsg = data.errors && Array.isArray(data.errors)
        ? data.errors.map((e: any) => e.message).join("\n")
        : (data.message || `Request failed with status ${response.status}`);
      const err = new Error(errMsg) as any;
      err.errors = data.errors;
      throw err;
    }

    return data;
  } catch (error: any) {
    console.error(`[API ERROR] ${options.method || "GET"} ${endpoint}:`, error.message || error);
    throw error;
  }
}
