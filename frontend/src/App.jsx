import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignInPage from './pages/SignInPage';
import DegreeSelectPage from './pages/DegreeSelectPage';
import DashboardPage from './pages/DashboardPage';
import ProgressPage from './pages/ProgressPage';
import CoursesPage from './pages/CoursesPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import AdminCoursesPage from './pages/admin/CoursesPage';
import AdminCurriculumsPage from './pages/admin/CurriculumsPage';
import AdminProgramsPage from './pages/admin/ProgramsPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AppLayout from './components/AppLayout';
import { useAuth } from './context/AuthContext';
import { LoadingSpinner } from "@/components/ui/loading";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster } from 'react-hot-toast';
import { toasterConfig } from './lib/toast-styles';

const App = () => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Toaster {...toasterConfig} />
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/degree-select" element={<ProtectedRoute><DegreeSelectPage /></ProtectedRoute>} />
          
          {/* Protected routes */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
            <Route path="/courses" element={<ProtectedRoute><CoursesPage /></ProtectedRoute>} />
            
            {/* Admin routes */}
            <Route path="/admin">
              <Route index element={<Navigate to="/admin/users" replace />} />
              <Route path="users" element={<AdminRoute><UserManagementPage /></AdminRoute>} />
              <Route path="courses" element={<AdminRoute><AdminCoursesPage /></AdminRoute>} />
              <Route path="curriculums" element={<AdminRoute><AdminCurriculumsPage /></AdminRoute>} />
              <Route path="programs" element={<AdminRoute><AdminProgramsPage /></AdminRoute>} />
            </Route>
          </Route>

          {/* Default route */}
          <Route path="/" element={<Navigate to="/sign-in" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;