import { createContext, useState, useEffect, useContext, useRef } from 'react';
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
  const hasShownToast = useRef(false);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log('AuthContext: Checking auth status...');
        const data = await authAPI.getAuthStatus();
        console.log('AuthContext: Auth status response:', data);
        
        if (data.authenticated) {
          console.log('AuthContext: User authenticated:', data.user);
          setUser({
            ...data.user,
            isAdmin: data.user.role === 'Admin'
          });
          setAuthenticated(true);
        } else {
          console.log('AuthContext: User not authenticated');
          setUser(null);
          setAuthenticated(false);
          hasShownToast.current = false;
          // Redirect to sign-in if not on sign-in page
          if (!window.location.pathname.includes('/sign-in')) {
            console.log('AuthContext: Redirecting to sign-in');
            window.location.href = '/sign-in';
          }
        }
      } catch (error) {
        console.error('AuthContext: Authentication check failed:', error);
        setUser(null);
        setAuthenticated(false);
        hasShownToast.current = false;
        // Redirect to sign-in on error
        if (!window.location.pathname.includes('/sign-in')) {
          console.log('AuthContext: Redirecting to sign-in due to error');
          window.location.href = '/sign-in';
        }
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