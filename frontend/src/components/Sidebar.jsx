import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { BarChart2, BookOpen, FileText, Home, LogOut, Moon, Settings, Sun, Users } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeProvider";
import appLogo from "@/assets/app-logo.png";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  
  // Navigation items with icons
  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: Home },
    { name: "Progress", path: "/progress", icon: BarChart2 },
    { name: "Courses", path: "/courses", icon: BookOpen },
  ];

  // Admin navigation items
  const adminNavItems = [
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Courses", path: "/admin/courses", icon: BookOpen },
    { name: "Curriculums", path: "/admin/curriculums", icon: FileText },
    { name: "Programs", path: "/admin/programs", icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/sign-in');
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  return (
    <div className="flex flex-col h-full">
      <ShadcnSidebar 
        className="h-screen w-[240px] border-r border-[#a32c2e] dark:border-[#6b1a1b] bg-[#7b1113] dark:bg-[#4a0a0b]">
        {/* App logo and name section */}
        <SidebarHeader className="p-4 border-b border-[#a32c2e] dark:border-[#6b1a1b] bg-[#7b1113] dark:bg-[#4a0a0b]">
          <div className="flex items-center gap-3">
            <img
              src={appLogo}
              alt="App Logo"
                className="h-10 w-10 shrink-0"
              />
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-l font-medium text-white truncate">CourseMap</p>
              </div>
            </div>
        </SidebarHeader>

        {/* Navigation section */}
        <SidebarContent className="flex-1 overflow-auto py-2 bg-[#7b1113] dark:bg-[#4a0a0b] text-white dark:text-gray-100">
          <div className="px-1 py-2">
              <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight text-white">
                Menu
              </h2>
            <div className="space-y-1">
              {/* Show regular navigation only for non-admin users */}
              {user?.role !== 'Admin' && navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center rounded-lg px-2 py-2 text-sm font-medium transition-colors text-white dark:text-gray-100 mx-3",
                    location.pathname === item.path
                      ? "bg-[#a32c2e] dark:bg-[#6b1a1b] text-white dark:text-gray-100 pointer-events-none"
                      : "hover:bg-[#a32c2e] dark:hover:bg-[#6b1a1b] hover:text-white dark:hover:text-gray-100"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0 mr-2" />
                  <span>{item.name}</span>
                </Link>
              ))}

              {/* Admin Navigation */}
              {user?.role === 'Admin' && adminNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center rounded-lg px-2 py-2 text-sm font-medium transition-colors text-white dark:text-gray-100 mx-3",
                    location.pathname === item.path
                      ? "bg-[#a32c2e] dark:bg-[#6b1a1b] text-white dark:text-gray-100 pointer-events-none"
                      : "hover:bg-[#a32c2e] dark:hover:bg-[#6b1a1b] hover:text-white dark:hover:text-gray-100"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0 mr-2" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </SidebarContent>

        {/* Logout button and theme toggle */}
        <SidebarFooter className="p-4 border-t border-[#a32c2e] dark:border-[#6b1a1b] bg-[#7b1113] dark:bg-[#4a0a0b]">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="flex-1 justify-start gap-2 text-white hover:text-white dark:text-gray-100 hover:bg-[#a32c2e] dark:hover:bg-[#6b1a1b] focus:bg-[#a32c2e] dark:focus:bg-[#6b1a1b] active:bg-[#a32c2e] dark:active:bg-[#6b1a1b] border-none"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              Logout
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-white hover:text-white dark:text-gray-100 hover:bg-[#a32c2e] dark:hover:bg-[#6b1a1b] focus:bg-[#a32c2e] dark:focus:bg-[#6b1a1b] active:bg-[#a32c2e] dark:active:bg-[#6b1a1b] border-none"
              onClick={handleThemeToggle}
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>
          </div>
        </SidebarFooter>
      </ShadcnSidebar>
    </div>
  );
};

export default Sidebar; 