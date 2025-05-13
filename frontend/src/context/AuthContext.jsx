import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      console.log('[AuthContext] Starting auth status check...');
      const data = await authAPI.getAuthStatus();
      console.log('[AuthContext] Auth status response:', data);
      
      if (data.authenticated && data.user) {
        setUser({
          ...data.user,
          isAdmin: data.user.role?.toLowerCase() === 'admin'
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('[AuthContext] Auth status check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (credentials) => {
    try {
      const data = await authAPI.login(credentials);
      if (data.user) {
        setUser({
          ...data.user,
          isAdmin: data.user.role?.toLowerCase() === 'admin'
        });
      }
      return data;
    } catch (error) {
      console.error('[AuthContext] Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
    } catch (error) {
      console.error('[AuthContext] Logout failed:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 