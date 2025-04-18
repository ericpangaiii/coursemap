import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from "@/components/ui/loading";

const AdminRoute = ({ children }) => {
  const { authenticated, loading, user } = useAuth();

  // Show loading indicator while checking auth status
  if (loading) {
    return <LoadingSpinner fullPage />;
  }
  
  // Redirect to sign in if not authenticated
  if (!authenticated) {
    return <Navigate to="/sign-in" />;
  }

  // Redirect to dashboard if not an admin
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  
  // Render children if authenticated and admin
  return children;
};

export default AdminRoute; 