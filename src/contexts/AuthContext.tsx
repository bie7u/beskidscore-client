import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, AuthContextType } from '../utils/types';

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

// Mock user data for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Jan Kowalski',
    email: 'jan.kowalski@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    provider: 'google',
    totalPoints: 245,
    correctPredictions: 18,
    totalPredictions: 32,
    rank: 3,
    joinDate: '2025-01-01'
  },
  {
    id: '2',
    name: 'Anna Nowak',
    email: 'anna.nowak@facebook.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c4b7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    provider: 'facebook',
    totalPoints: 312,
    correctPredictions: 23,
    totalPredictions: 35,
    rank: 1,
    joinDate: '2024-12-15'
  }
];

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const savedUser = localStorage.getItem('beskidscore_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('beskidscore_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    
    try {
      // Mock authentication - in real app this would integrate with OAuth
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // For demo purposes, use first mock user for Google, second for Facebook
      const mockUser = provider === 'google' ? mockUsers[0] : mockUsers[1];
      
      setUser(mockUser);
      localStorage.setItem('beskidscore_user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('beskidscore_user');
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        isAuthenticated, 
        loading 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};