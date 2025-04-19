import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const AppLayout = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <div className="p-2 md:p-4">
            <SidebarTrigger />
            <Outlet />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout; 