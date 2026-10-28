import React, { useState } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import LoginRequiredModal from "../components/common/LoginRequiredModal";
import AIChatbotDrawer from "../components/common/AIChatbotDrawer";

const DashboardLayout = ({ children, role = "buyer" }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-ivory-100 font-sans text-navy-800 selection:bg-gold-100 selection:text-navy-900 overflow-x-hidden">
      <Sidebar
        role={role}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
        <DashboardNavbar onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)} />
        <main className="p-4 sm:p-6 lg:p-10 flex-1 overflow-y-auto max-w-full">
          {children}
        </main>
      </div>
      <LoginRequiredModal />
      <AIChatbotDrawer />
    </div>
  );
};

export default DashboardLayout;
