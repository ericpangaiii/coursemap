import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignInPage from './pages/SignInPage';
import DegreeSelectPage from './pages/DegreeSelectPage';
import DashboardPage from './pages/DashboardPage';
import ProgressPage from './pages/ProgressPage';
import CoursesPage from './pages/CoursesPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import UserPlansPage from './pages/admin/UserPlansPage';
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
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
            <Route path="/courses" element={<ProtectedRoute><CoursesPage /></ProtectedRoute>} />
            <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
            <Route path="/admin/users" element={<AdminRoute><UserManagementPage /></AdminRoute>} />
            <Route path="/admin/plans" element={<AdminRoute><UserPlansPage /></AdminRoute>} />
          </Route>
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/degree-select" element={<ProtectedRoute><DegreeSelectPage /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/sign-in" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;