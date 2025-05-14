import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getAuthStatus();
      if (response.authenticated && response.user) {
        setUser({
          ...response.user,
          isAdmin: response.user.role?.toLowerCase() === 'admin'
        });
        setAuthenticated(true);
      } else {
        setUser(null);
        setAuthenticated(false);
      }
    } catch (error) {
      console.error('[AuthContext] Auth status check failed:', error);
      setUser(null);
      setAuthenticated(false);
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
        setAuthenticated(true);
        return data;
      }
      return null;
    } catch (error) {
      console.error('[AuthContext] Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      setAuthenticated(false);
    } catch (error) {
      console.error('[AuthContext] Logout failed:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    authenticated,
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