import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '@/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Initial loading state
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = authService.getToken();
      if (token) {
        try {
          const response = await authService.getCurrentUser();
          if (response.success && response.data?.user) {
            setUser(response.data.user);
            setIsAuthenticated(true);
          } else {
            // Token exists but user data couldn't be fetched (e.g., token expired/invalid)
            authService.removeAuthData();
            setIsAuthenticated(false);
            setUser(null);
            navigate('/login');
          }
        } catch (error) {
          console.error('Failed to fetch current user:', error);
          authService.removeAuthData();
          setIsAuthenticated(false);
          setUser(null);
          navigate('/login');
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (token: string, userData: User) => {
    authService.setAuthData(token, userData);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout failed on server:', error);
      // Even if server logout fails, clear client-side data
    } finally {
      authService.removeAuthData();
      setUser(null);
      setIsAuthenticated(false);
      toast({
        title: 'تم تسجيل الخروج',
        description: 'لقد تم تسجيل خروجك بنجاح.',
        variant: 'default',
      });
      navigate('/login');
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        authService.updateUserInLocalStorage(response.data.user);
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      // Optionally, force logout if refresh fails
      // logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
