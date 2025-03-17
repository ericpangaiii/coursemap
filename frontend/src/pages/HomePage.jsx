import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const HomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/sign-in');
  };

  // Debug: Log user object
  useEffect(() => {
    console.log('User data in HomePage:', user);
  }, [user]);

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        
        {user && (
          <div className="mb-6">
            {user.photo ? (
              <img 
                src={user.photo} 
                alt={user.displayName} 
                className="w-16 h-16 rounded-full mx-auto mb-2"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.displayName);
                }}
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center mx-auto mb-2">
                <span className="text-lg text-gray-600">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : '?'}
                </span>
              </div>
            )}
            <h2 className="text-xl font-semibold">{user.displayName}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
        )}
        
        <button 
          onClick={handleLogout} 
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default HomePage;
