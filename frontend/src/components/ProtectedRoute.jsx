import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { authenticated, loading } = useAuth();

  // Show loading indicator while checking auth status
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Redirect to sign in if not authenticated
  if (!authenticated) {
    return <Navigate to="/sign-in" />;
  }
  
  // Render children if authenticated
  return children;
};

export default ProtectedRoute; 