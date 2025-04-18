import { useAuth } from '@/context/AuthContext';

// Hook to check if current user is an admin
export const useIsAdmin = () => {
  const { user } = useAuth();
  return user?.isAdmin || false;
};

// Higher-order component to protect admin routes
export const withAdminAccess = (Component) => {
  return (props) => {
    const { user, loading } = useAuth();

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!user?.isAdmin) {
      return <div>Access denied. Admin privileges required.</div>;
    }

    return <Component {...props} />;
  };
}; 