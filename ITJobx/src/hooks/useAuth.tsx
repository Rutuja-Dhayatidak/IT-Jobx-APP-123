import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';
import { setToken } from '../services/api';
import { authTokenService } from '../services/authToken.service';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  setUser: (user: any) => void;
  setAccessToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync token to api helper
  const setAccessToken = (token: string | null) => {
    setAccessTokenState(token);
    setToken(token);
  };

  const refreshSession = async () => {
    try {
      const profile = await authService.getProfile();
      if (profile) {
        setUser(profile);
        await AsyncStorage.setItem('user', JSON.stringify(profile));
      }
    } catch (err) {
      console.warn("Failed to refresh session:", err);
    }
  };

  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedToken = await authTokenService.getAccessToken();
        const savedUser = await AsyncStorage.getItem('user');

        if (savedToken) {
          setAccessToken(savedToken);
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
          // Validate and load latest profile
          const profile = await authService.getProfile();
          if (profile) {
            setUser(profile);
            await AsyncStorage.setItem('user', JSON.stringify(profile));
          }
        }
      } catch (err) {
        console.warn("Session validation failed. Treating as Guest.", err);
        // Clean up invalid session
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authService.login(email, password);
    if (res && res.token) {
      setAccessToken(res.token);
      setUser(res.user);
      await AsyncStorage.setItem('user', JSON.stringify(res.user));
    }
    return res;
  };

  const logout = async () => {
    setAccessToken(null);
    setUser(null);
    await AsyncStorage.removeItem('user');
    await authTokenService.clearAllTokens();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!accessToken,
        user,
        accessToken,
        refreshToken: null,
        isLoading,
        login,
        logout,
        refreshSession,
        setUser,
        setAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
