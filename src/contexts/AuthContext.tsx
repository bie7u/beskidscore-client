import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AuthContextType, User, AuthTokens, LoginCredentials } from '../utils/types';
import { authUtils } from '../utils/authUtils';
import { apiService } from '../utils/apiService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const accessToken = authUtils.getAccessToken();
      const refreshToken = authUtils.getRefreshToken();

      if (accessToken && refreshToken) {
        setTokens({ access: accessToken, refresh: refreshToken });
        
        try {
          // Fetch current user data
          const userData = await apiService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          // Clear invalid tokens
          authUtils.clearTokens();
          setTokens(null);
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await apiService.login(credentials);
      
      authUtils.setTokens(response.tokens);
      setTokens(response.tokens);
      setUser(response.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    authUtils.clearTokens();
    setTokens(null);
    setUser(null);
  };

  const refreshAccessToken = async () => {
    const refreshToken = authUtils.getRefreshToken();
    
    if (!refreshToken) {
      logout();
      throw new Error('No refresh token available');
    }

    try {
      const response = await apiService.refreshToken(refreshToken);
      const newTokens = { access: response.access, refresh: refreshToken };
      
      authUtils.setTokens(newTokens);
      setTokens(newTokens);
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    tokens,
    login,
    logout,
    refreshAccessToken,
    isAuthenticated: !!user && !!tokens,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
