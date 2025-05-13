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
    const checkAuthStatus = async (retryCount = 0) => {
      try {
        console.log('[AuthContext] Starting auth status check...');
        console.log('[AuthContext] Current path:', window.location.pathname);
        console.log('[AuthContext] Current URL:', window.location.href);
        
        // If we're on the dashboard after OAuth callback, wait a bit for session to establish
        if (window.location.pathname === '/dashboard' && window.location.search.includes('code=')) {
          console.log('[AuthContext] Detected OAuth callback, waiting for session...');
          await new Promise(resolve => setTimeout(resolve, 2000)); // Increased wait time
        }
        
        const data = await authAPI.getAuthStatus();
        console.log('[AuthContext] Auth status response:', data);
        
        if (data.authenticated) {
          console.log('[AuthContext] User authenticated:', data.user);
          setUser({
            ...data.user,
            isAdmin: data.user.role === 'Admin'
          });
          setAuthenticated(true);
        } else {
          console.log('[AuthContext] User not authenticated');
          
          // If we're on dashboard after OAuth and not authenticated, retry a few times
          if (window.location.pathname === '/dashboard' && window.location.search.includes('code=') && retryCount < 3) {
            console.log(`[AuthContext] Retrying auth check (attempt ${retryCount + 1})...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return checkAuthStatus(retryCount + 1);
          }
          
          setUser(null);
          setAuthenticated(false);
          hasShownToast.current = false;
          
          // Only redirect if not on sign-in page and not during OAuth callback
          if (!window.location.pathname.includes('/sign-in') && 
              !window.location.pathname.includes('/auth/google/callback')) {
            console.log('[AuthContext] Redirecting to sign-in from:', window.location.pathname);
            window.location.href = '/sign-in';
          }
        }
      } catch (error) {
        console.error('[AuthContext] Error checking auth status:', error);
        
        // If we're on dashboard after OAuth and got an error, retry a few times
        if (window.location.pathname === '/dashboard' && window.location.search.includes('code=') && retryCount < 3) {
          console.log(`[AuthContext] Retrying auth check after error (attempt ${retryCount + 1})...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return checkAuthStatus(retryCount + 1);
        }
        
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