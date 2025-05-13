import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/loading';

export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  console.log('[AdminRoute] Auth state:', { user, loading });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner fullPage />
      </div>
    );
  }

  if (!user || user.role?.toLowerCase() !== 'admin') {
    console.log('[AdminRoute] User not authorized:', user);
    return <Navigate to="/sign-in" replace />;
  }

  console.log('[AdminRoute] Rendering admin content');
  return children;
}; 