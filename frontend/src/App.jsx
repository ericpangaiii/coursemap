import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignInPage from './pages/SignInPage';
import DashboardPage from './pages/DashboardPage';
import ProgressPage from './pages/ProgressPage';
import CoursesPage from './pages/CoursesPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import AdminCoursesPage from './pages/admin/CoursesPage';
import AdminCurriculumsPage from './pages/admin/CurriculumsPage';
import AdminProgramsPage from './pages/admin/ProgramsPage';
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
          
          {/* Main routes */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            
            {/* Admin routes */}
            <Route path="/admin">
              <Route index element={<Navigate to="/admin/users" replace />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="courses" element={<AdminCoursesPage />} />
              <Route path="curriculums" element={<AdminCurriculumsPage />} />
              <Route path="programs" element={<AdminProgramsPage />} />
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