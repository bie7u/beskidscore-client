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

  // Initialize auth state from server (check if user is authenticated via cookies)
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try to fetch current user - if successful, user is authenticated via cookies
        // Use skipAutoRefresh=true to prevent infinite loop on initial load
        const userData = await apiService.getCurrentUser(true);
        setUser(userData);
        // Set dummy tokens for backward compatibility (actual tokens are in HTTP-only cookies)
        setTokens({ access: 'cookie-based', refresh: 'cookie-based' });
      } catch (_error) {
        // User is not authenticated or session expired
        console.log('User not authenticated or session expired');
        setUser(null);
        setTokens(null);
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await apiService.login(credentials);
      
      // Server sets HTTP-only cookies automatically
      // We just update the client-side state
      if (response.tokens) {
        authUtils.setTokens(response.tokens); // No-op, just for logging
      }
      // Set dummy tokens for backward compatibility
      setTokens({ access: 'cookie-based', refresh: 'cookie-based' });
      setUser(response.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call server logout endpoint to clear HTTP-only cookies
      // Skip auto-refresh to avoid unnecessary token refresh attempts during logout
      await apiService.logout(true);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Clear client-side state regardless of server response
      authUtils.clearTokens(); // No-op, just for logging
      setTokens(null);
      setUser(null);
    }
  };

  const refreshAccessToken = async () => {
    try {
      // With HTTP-only cookies, refresh token is automatically sent
      await apiService.refreshToken();
      // Server sets new cookies automatically
      // Update dummy tokens for backward compatibility
      setTokens({ access: 'cookie-based', refresh: 'cookie-based' });
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
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
