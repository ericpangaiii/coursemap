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
import { BarChart2, BookOpen, Home, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { programsAPI } from "@/lib/api";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const [programTitle, setProgramTitle] = useState("Not assigned");
  
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
    <ShadcnSidebar collapsible="icon" className="h-screen border-r">
      {/* User profile section */}
      <SidebarHeader className={cn(
        "p-4 border-b",
        state === "collapsed" ? "flex justify-center items-center p-2" : ""
      )}>
        {state === "collapsed" ? (
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.photo} alt={user?.name} />
            <AvatarFallback>{getInitials(user?.name || "")}</AvatarFallback>
          </Avatar>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={user?.photo} alt={user?.name} />
                <AvatarFallback>{getInitials(user?.name || "")}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name || "Guest"}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">{programTitle}</p>
            </div>
          </>
        )}
      </SidebarHeader>

      {/* Navigation section */}
      <SidebarContent className="flex-1 overflow-auto py-2">
        <div className="px-3 py-2">
          {state === "expanded" && (
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Menu
            </h2>
          )}
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  state === "collapsed" ? "justify-center px-2" : "",
                  location.pathname === item.path
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0", state === "expanded" ? "mr-3" : "")} />
                {state === "expanded" && <span>{item.name}</span>}
              </Link>
            ))}
          </div>
        </div>
      </SidebarContent>

      {/* Logout button */}
      <SidebarFooter className={cn("p-4", state === "collapsed" ? "p-2" : "")}>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="default"
            onClick={handleLogout}
            className="h-10 px-4 text-gray-500 hover:text-red-600 hover:bg-red-50 w-full justify-start"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </div>
      </SidebarFooter>
    </ShadcnSidebar>
  );
};

export default Sidebar; 