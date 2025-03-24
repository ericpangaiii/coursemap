import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignInPage from './pages/SignInPage';
import DegreeSelectPage from './pages/DegreeSelectPage';
import DashboardPage from './pages/DashboardPage';
import ProgressPage from './pages/ProgressPage';
import ProfilePage from './pages/ProfilePage';
import CoursesPage from './pages/CoursesPage';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import { useAuth } from './context/AuthContext';

const App = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Auth routes */}
        <Route path="/sign-in" element={<SignInPage />} />
        <Route 
          path="/degree-select" 
          element={
            <ProtectedRoute>
              <DegreeSelectPage />
            </ProtectedRoute>
          } 
        />

        {/* App routes with sidebar layout */}
        <Route 
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/home" element={<DashboardPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/courses" element={<CoursesPage />} />
        </Route>
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/sign-in" replace />} />
      </Routes>
    </Router>
  );
};

export default App;