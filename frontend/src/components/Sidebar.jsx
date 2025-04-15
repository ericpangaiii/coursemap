import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Sidebar as ShadcnSidebar, 
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { BarChart2, BookOpen, Home, LogOut, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { programsAPI } from "@/lib/api";
import { useTheme } from "./ThemeProvider";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const [programTitle, setProgramTitle] = useState("Not assigned");
  const { theme, toggleTheme } = useTheme();
  
  // Fetch program details
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        if (user?.program_id) {
          const programData = await programsAPI.getProgramById(user.program_id);
          if (programData && programData.title) {
            setProgramTitle(programData.title);
          }
        }
      } catch (error) {
        console.error("Error fetching program details:", error);
      }
    };

    fetchDetails();
  }, [user?.program_id]);
  
  // Navigation items with icons
  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: Home },
    { name: "Progress", path: "/progress", icon: BarChart2 },
    { name: "Courses", path: "/courses", icon: BookOpen },
  ];

  // Helper to get initials from name
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/sign-in');
  };

  return (
    <div className="flex flex-col h-full">
      <ShadcnSidebar collapsible="icon" className="h-screen w-[240px] border-r dark:border-gray-800">
        {/* User profile section */}
        <SidebarHeader className={cn(
          "p-4 border-b dark:border-gray-800",
          state === "collapsed" ? "flex justify-center items-center p-2" : ""
        )}>
          {state === "collapsed" ? (
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.photo} alt={user?.name} />
              <AvatarFallback className="dark:bg-gray-800 dark:text-gray-200">{getInitials(user?.name || "")}</AvatarFallback>
            </Avatar>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={user?.photo} alt={user?.name} />
                  <AvatarFallback className="dark:bg-gray-800 dark:text-gray-200">{getInitials(user?.name || "")}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user?.name || "Guest"}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">{programTitle}</p>
              </div>
            </>
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
              {navItems.map((item) => (
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
              onClick={toggleTheme}
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