import { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '@/lib/api';

// Create the auth context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const data = await authAPI.getAuthStatus();
        
        if (data.authenticated) {
          setUser(data.user);
          setAuthenticated(true);
        } else {
          setUser(null);
          setAuthenticated(false);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setUser(null);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Function to handle logout
  const logout = async () => {
    try {
      const data = await authAPI.logout();
      
      if (data.success) {
        setUser(null);
        setAuthenticated(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Logout failed:', error);
      return false;
    }
  };

  // Function to update user data in the context
  const updateUser = (userData) => {
    if (userData) {
      setUser(prevUser => ({
        ...prevUser,
        ...userData
      }));
    }
  };

  // Values to be provided to the context
  const value = {
    user,
    loading,
    authenticated,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 