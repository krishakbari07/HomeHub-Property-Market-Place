import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  Search,
  X,
  RefreshCw,
  LogOut,
  ChevronDown,
  ExternalLink,
  Settings,
  ChevronRight,
  Shield,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../common/NotificationBell";

export default function AdminHeader({
  title = "Dashboard",
  breadcrumbs = [{ label: "Administration" }, { label: "Dashboard" }],
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  loading = false,
  onRefresh,
  onOpenMobile,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    setProfileOpen(false);
    logout();
    navigate("/");
  };

  return (
    <header className="h-16 bg-white border-b border-[#E8E4DB] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Left: Mobile trigger & Breadcrumbs / Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-[#F7F5F0] transition-colors"
          aria-label="Open navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0 leading-tight">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <span className="text-slate-400">HomeHub</span>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.label}>
                <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                {crumb.path ? (
                  <Link
                    to={crumb.path}
                    className="hover:text-slate-800 transition-colors truncate"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    className={`truncate ${
                      idx === breadcrumbs.length - 1
                        ? "text-slate-800 font-semibold"
                        : "text-slate-500"
                    }`}
                  >
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* Current Page Title */}
          <h1 className="font-heading font-bold text-base sm:text-lg text-[#172B3A] tracking-tight truncate mt-0.5">
            {title}
          </h1>
        </div>
      </div>

      {/* Right: Search, Refresh & Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Working Search Bar (Only shown if search handler provided) */}
        {typeof onSearchChange === "function" && (
          <div className="relative hidden md:block w-56 lg:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchValue || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-[#F7F5F0] border border-[#E8E4DB] rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#315C4B] focus:bg-white transition-colors"
            />
            {searchValue && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Live Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-[#F7F5F0] border border-transparent hover:border-[#E8E4DB] transition-all disabled:opacity-50"
            title="Refresh dataset from MongoDB"
            aria-label="Refresh dataset"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin text-[#315C4B]" : ""}`}
            />
          </button>
        )}

        {/* In-App Notification Bell */}
        <NotificationBell />

        {/* Admin Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-[#F7F5F0] transition-colors focus:outline-none"
            aria-expanded={profileOpen}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 rounded-lg bg-[#315C4B] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {user?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <span className="text-xs font-semibold text-slate-900 block truncate max-w-[110px]">
                {user?.name || "Administrator"}
              </span>
              <span className="text-[10px] text-slate-500 block">
                Admin Console
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* Dropdown Menu */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-md border border-[#E8E4DB] py-1.5 text-xs text-slate-700 z-50 animate-in fade-in-50 duration-150">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="font-semibold text-slate-900 truncate">
                  {user?.name || "Administrator"}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {user?.email || "admin@homehub.com"}
                </p>
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-[#F7F5F0] text-[10px] font-semibold text-[#315C4B] border border-[#E8E4DB]">
                  <Shield className="w-3 h-3 text-[#315C4B]" />
                  System Administrator
                </span>
              </div>

              <div className="py-1">
                <Link
                  to="/admin/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 hover:bg-[#F7F5F0] text-slate-700 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>System Settings</span>
                </Link>

                <Link
                  to="/"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 hover:bg-[#F7F5F0] text-slate-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                  <span>Public Marketplace</span>
                </Link>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-700 hover:bg-rose-50 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
