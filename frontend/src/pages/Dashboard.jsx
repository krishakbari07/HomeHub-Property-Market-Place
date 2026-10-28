import React from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BuyerDashboard from "../components/BuyerDashboard";
import SellerDashboard from "../components/SellerDashboard";
import AgentDashboard from "../components/AgentDashboard";
import { ShoppingBag, Home, Briefcase } from "lucide-react";

const Dashboard = () => {
  const { user, switchRole } = useAuth();
  const [searchParams] = useSearchParams();
  const activeTabParam = searchParams.get("tab") || "overview";
  const currentRole = user?.role || "Buyer";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Welcome Header & Role Switcher Bar */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img
            src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
            alt={user?.name}
            className="w-16 h-16 rounded-full object-cover ring-4 ring-indigo-100 shrink-0"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold text-gray-900">Welcome, {user?.name || "User"}!</h1>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                {currentRole} Dashboard
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-1">
              {user?.email} • {user?.phone || "+91 98980 12345"}
            </p>
          </div>
        </div>

        {/* Interactive Role Switcher Pills for Testing */}
        <div className="space-y-1 text-center md:text-right">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Switch Dashboard View</div>
          <div className="inline-flex p-1 bg-gray-100 rounded-2xl space-x-1 border border-gray-200">
            {[
              { role: "Buyer", icon: ShoppingBag, label: "Buyer" },
              { role: "Seller", icon: Home, label: "Seller" },
              { role: "Agent", icon: Briefcase, label: "Agent" }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = currentRole === tab.role;
              return (
                <button
                  key={tab.role}
                  onClick={() => switchRole(tab.role)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Role-Specific Dashboard Content */}
      {currentRole === "Buyer" && <BuyerDashboard user={user} initialTab={activeTabParam} />}
      {currentRole === "Seller" && <SellerDashboard user={user} initialTab={activeTabParam} />}
      {currentRole === "Agent" && <AgentDashboard user={user} initialTab={activeTabParam} />}

    </div>
  );
};

export default Dashboard;
