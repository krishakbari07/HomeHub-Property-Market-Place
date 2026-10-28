import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Heart, MessageSquare, Calendar, User, LogOut,
  Building2, PlusCircle, FileText, TrendingUp, Users, Sparkles, ArrowLeft, X, Tag
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ role = "buyer", isOpen = false, onClose = () => {} }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/");
  };

  const navConfigs = {
    buyer: [
      { name: "Executive Overview", path: "/buyer/dashboard", icon: LayoutDashboard },
      { name: "My Bids & Offers", path: "/buyer/offers", icon: Tag },
      { name: "Saved Wishlist", path: "/buyer/wishlist", icon: Heart },
      { name: "My Inquiries", path: "/buyer/inquiries", icon: MessageSquare },
      { name: "Scheduled Visits", path: "/buyer/visits", icon: Calendar },
      { name: "AI Property Finder", path: "/ai-recommendations", icon: Sparkles },
      { name: "Client Profile", path: "/buyer/profile", icon: User },
    ],
    seller: [
      { name: "Seller Overview", path: "/seller/dashboard", icon: LayoutDashboard },
      { name: "My Properties", path: "/seller/properties", icon: Building2 },
      { name: "Add Property", path: "/seller/add-property", icon: PlusCircle },
      { name: "Offers & Bids", path: "/seller/offers", icon: FileText },
      { name: "Buyer Inquiries", path: "/seller/inquiries", icon: MessageSquare },
      { name: "Listing Analytics", path: "/seller/analytics", icon: TrendingUp },
      { name: "Owner Profile", path: "/seller/profile", icon: User },
    ],
    agent: [
      { name: "Broker Overview", path: "/agent/dashboard", icon: LayoutDashboard },
      { name: "Managed Listings", path: "/agent/listings", icon: Building2 },
      { name: "Add New Listing", path: "/agent/add-listing", icon: PlusCircle },
      { name: "Offers & Bids", path: "/agent/offers", icon: Tag },
      { name: "Client CRM", path: "/agent/clients", icon: Users },
      { name: "Site Appointments", path: "/agent/appointments", icon: Calendar },
      { name: "Broker Analytics", path: "/agent/analytics", icon: TrendingUp },
      { name: "Advisor Profile", path: "/agent/profile", icon: User },
    ],
    admin: [
      { name: "Executive Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
      { name: "User Directory", path: "/admin/users", icon: Users },
      { name: "Marketplace Properties", path: "/admin/properties", icon: Building2 },
      { name: "Scheduled Visits", path: "/admin/appointments", icon: Calendar },
      { name: "Client Inquiries", path: "/admin/inquiries", icon: MessageSquare },
      { name: "Visitor Analytics", path: "/admin/analytics", icon: TrendingUp },
    ],
  };

  const rawRole = (user?.role || role).toLowerCase();
  const activeRole = (rawRole === "rental" || rawRole === "renter") ? "buyer" : rawRole;
  const navItems = navConfigs[activeRole] || navConfigs.buyer;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-navy-950 text-white min-h-screen flex flex-col justify-between p-6 shrink-0 shadow-card border-r border-navy-800 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          {/* Brand Logo & Mobile Close Button */}
          <div className="flex items-center justify-between">
            <Link
              to="/"
              onClick={onClose}
              className="flex items-center space-x-3 group"
            >
              <div className="w-9 h-9 rounded-xl bg-navy-800 border border-navy-700 flex items-center justify-center text-white shadow-subtle group-hover:bg-navy-700 transition-colors">
                <Building2 className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <span className="font-heading font-extrabold text-xl text-white block">HomeHub</span>
                <span className="text-[10px] font-bold text-gold-400 tracking-wider uppercase block -mt-0.5">
                  {activeRole.toUpperCase()} PORTAL
                </span>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-xl text-navy-400 hover:text-white hover:bg-navy-900 transition-colors"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Badge */}
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-3.5 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-forest-700 text-white flex items-center justify-center font-bold text-sm shadow-subtle shrink-0">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="overflow-hidden leading-tight">
              <p className="font-bold text-sm text-white truncate">{user?.name || "User"}</p>
              <p className="text-xs text-gold-400 font-semibold capitalize">{user?.role || "Buyer"}</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-320px)] pr-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all min-h-[40px] ${
                    isActive
                      ? "bg-forest-700 text-white shadow-subtle border border-forest-600 font-bold"
                      : "text-navy-300 hover:text-white hover:bg-navy-900"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-navy-800 space-y-2 shrink-0">
          <Link
            to="/"
            onClick={onClose}
            className="w-full flex items-center space-x-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-navy-400 hover:text-white hover:bg-navy-900 transition-colors min-h-[40px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Public Marketplace</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors min-h-[40px]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
