import { Platform } from 'react-native';

// Using localhost:5001 since adb reverse tcp:5001 tcp:5001 is active for physical Android devices / simulators
export const BASE_URL = 'http://localhost:5001/api';

let authToken: string | null = null;

export const setToken = (token: string | null) => {
  authToken = token;
};

export const getToken = () => {
  return authToken;
};

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type');
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error: any) {
    console.error(`[API ERROR] ${options.method || 'GET'} ${endpoint}:`, error.message || error);
    throw error;
  }
}
