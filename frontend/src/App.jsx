import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignInPage from './pages/SignInPage';
import DegreeSelectPage from './pages/DegreeSelectPage';
import DashboardPage from './pages/DashboardPage';
import ProgressPage from './pages/ProgressPage';
import CoursesPage from './pages/CoursesPage';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import { useAuth } from './context/AuthContext';
import { LoadingSpinner } from "@/components/ui/loading";

const App = () => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute><CoursesPage /></ProtectedRoute>} />
        </Route>
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/degree-select" element={<ProtectedRoute><DegreeSelectPage /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/sign-in" />} />
      </Routes>
    </Router>
  );
};

export default App;