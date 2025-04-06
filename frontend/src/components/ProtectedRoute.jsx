import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from "@/components/ui/loading";

const ProtectedRoute = ({ children }) => {
  const { authenticated, loading } = useAuth();

  // Show loading indicator while checking auth status
  if (loading) {
    return <LoadingSpinner fullPage />;
  }
  
  // Redirect to sign in if not authenticated
  if (!authenticated) {
    return <Navigate to="/sign-in" />;
  }
  
  // Render children if authenticated
  return children;
};

export default ProtectedRoute; 