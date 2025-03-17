import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const HomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Check if user has a program from sign-up
  useEffect(() => {
    // Debug: Log user object
    console.log('User data in HomePage:', user);

    const savedProgram = localStorage.getItem('selectedProgram');
    
    if (user && savedProgram && !user.program) {
      // User has a saved program from sign-up but hasn't set it in their profile yet
      updateUserProgram(savedProgram);
    }
  }, [user]);

  const updateUserProgram = async (programId) => {
    try {
      const response = await fetch('http://localhost:3000/auth/update-program', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ programId }),
      });

      const data = await response.json();

      if (data.success) {
        // Clear the saved program from localStorage
        localStorage.removeItem('selectedProgram');
      } else {
        console.error('Failed to update program:', data.error);
      }
    } catch (err) {
      console.error('Error updating program:', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/sign-in');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">CourseMap</h1>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Dashboard</CardTitle>
          <CardDescription>Welcome to your CourseMap dashboard</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {user && (
            <div className="flex items-center space-x-4">
              {user.displayPicture ? (
                <img 
                  src={user.displayPicture} 
                  alt={user.name} 
                  className="w-16 h-16 rounded-full"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name);
                  }}
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-lg text-gray-600">
                    {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-end border-t pt-4">
          <Button 
            onClick={handleLogout} 
            variant="destructive"
          >
            Log Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default HomePage;
