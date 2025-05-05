import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { BarChart2, BookOpen, FileText, Home, LogOut, Moon, Settings, Sun, Users } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeProvider";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
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
      <ShadcnSidebar collapsible="icon" className="h-screen w-[240px] border-r dark:border-gray-800">
        {/* App logo and name section */}
        <SidebarHeader className={cn(
          "p-4 border-b dark:border-gray-800",
          state === "collapsed" ? "flex justify-center items-center p-2" : ""
        )}>
          {state === "collapsed" ? (
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">CM</span>
            </div>
          ) : (
              <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-lg">CM</span>
              </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-l font-medium text-gray-900 dark:text-gray-100 truncate">CourseMap</p>
              </div>
            </div>
          )}
        </SidebarHeader>

        {/* Navigation section */}
        <SidebarContent className="flex-1 overflow-auto py-2">
          <div className="px-1 py-2">
            {state === "expanded" && (
              <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">
                Menu
              </h2>
            )}
            <div className="space-y-1">
              {/* Show regular navigation only for non-admin users */}
              {user?.role !== 'Admin' && navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center rounded-lg px-2 py-2 text-sm font-medium transition-colors",
                    state === "collapsed" ? "justify-center px-2 w-10" : "mx-3",
                    location.pathname === item.path
                      ? "bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-900 dark:text-gray-100"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[hsl(220,10%,20%)] hover:text-gray-900 dark:hover:text-gray-100"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 flex-shrink-0", state === "expanded" ? "mr-2" : "")} />
                  {state === "expanded" && <span>{item.name}</span>}
                </Link>
              ))}

              {/* Admin Navigation */}
              {user?.role === 'Admin' && adminNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center rounded-lg px-2 py-2 text-sm font-medium transition-colors",
                    state === "collapsed" ? "justify-center px-2 w-10" : "mx-3",
                    location.pathname === item.path
                      ? "bg-gray-100 dark:bg-[hsl(220,10%,25%)] text-gray-900 dark:text-gray-100"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[hsl(220,10%,20%)] hover:text-gray-900 dark:hover:text-gray-100"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 flex-shrink-0", state === "expanded" ? "mr-2" : "")} />
                  {state === "expanded" && <span>{item.name}</span>}
                </Link>
              ))}
            </div>
          </div>
        </SidebarContent>

        {/* Logout button and theme toggle */}
        <SidebarFooter className={cn("p-4 border-t dark:border-gray-800", state === "collapsed" ? "p-2" : "")}>
          <div className={cn("flex items-center gap-2", state === "collapsed" ? "flex-col-reverse gap-1" : "")}>
            <Button
              variant="ghost"
              className={cn(
                "justify-start gap-2",
                state === "collapsed" ? "w-10 h-10 p-0 flex items-center justify-center" : "flex-1",
                location.pathname === "/sign-out"
                  ? "bg-accent text-accent-foreground dark:bg-[hsl(220,10%,25%)] dark:text-accent-foreground"
                  : "hover:bg-accent/50 dark:hover:bg-[hsl(220,10%,20%)]"
              )}
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              {state === "expanded" && "Logout"}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-10 w-10 hover:bg-accent/50 dark:hover:bg-[hsl(220,10%,20%)]",
                state === "collapsed" ? "mt-0" : ""
              )}
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