import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, User, LogOut, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useProperty } from "../../context/PropertyContext";
import NotificationBell from "../common/NotificationBell";

const DashboardNavbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { wishlistProperties } = useProperty();

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const role = user?.role?.toLowerCase() || "buyer";
  const profilePath =
    role === "seller"
      ? "/seller/profile"
      : role === "agent"
      ? "/agent/profile"
      : role === "admin"
      ? "/admin/dashboard"
      : "/buyer/profile";

  const wishlistPath = role === "seller" || role === "agent" ? "/seller/properties" : "/buyer/wishlist";

  return (
    <header className="bg-white border-b border-ivory-300 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-subtle">
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {/* Mobile Hamburger Menu Button */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-navy-700 hover:text-navy-950 hover:bg-ivory-100 transition-colors border border-ivory-300 min-h-[40px] min-w-[40px] flex items-center justify-center"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-base sm:text-lg font-heading font-extrabold text-navy-900 tracking-tight leading-none">
            Executive Portal
          </h2>
          <span className="px-2 py-0.5 bg-forest-50 text-forest-700 border border-forest-200 text-[10px] font-bold rounded-md capitalize inline-block mt-0.5">
            {user?.role || "Buyer"} Mode
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Wishlist Button in Top Navbar (Hidden for Admin) */}
        {role !== "admin" && (
          <Link
            to={wishlistPath}
            className="p-2 min-h-[38px] min-w-[38px] text-navy-600 hover:text-navy-900 hover:bg-ivory-100 rounded-xl relative transition-all flex items-center justify-center border border-ivory-300"
            title="Saved Properties"
            aria-label="Wishlist"
          >
            <Heart className={`w-4 h-4 ${wishlistProperties.length > 0 ? "text-forest-700 fill-forest-700" : ""}`} />
            {wishlistProperties.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-forest-700 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-subtle">
                {wishlistProperties.length}
              </span>
            )}
          </Link>
        )}

        {/* Notification Bell */}
        <NotificationBell />

        {/* User Profile Menu */}
        <div className="relative border-l border-ivory-300 pl-2 sm:pl-4">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2 sm:space-x-2.5 p-1 rounded-xl hover:bg-ivory-100 transition-all border border-transparent hover:border-ivory-300 min-h-[40px]"
            aria-expanded={showProfileMenu}
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-lg bg-navy-800 text-white flex items-center justify-center font-bold text-xs shadow-subtle shrink-0">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <span className="text-xs font-bold text-navy-900 block truncate max-w-[120px]">
                {user?.name || "User"}
              </span>
              <span className="text-[10px] text-forest-700 font-semibold capitalize block">
                {user?.role || "Buyer"}
              </span>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-card border border-ivory-300 p-2 space-y-1 z-50 animate-fadeIn">
              <Link
                to={profilePath}
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold text-navy-800 hover:bg-ivory-100 transition-colors"
              >
                <User className="w-4 h-4 text-navy-500" />
                <span>Profile Settings</span>
              </Link>
              {role !== "admin" && (
                <Link
                  to={wishlistPath}
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold text-navy-800 hover:bg-ivory-100 transition-colors"
                >
                  <Heart className="w-4 h-4 text-forest-700" />
                  <span>Wishlist ({wishlistProperties.length})</span>
                </Link>
              )}
              <div className="border-t border-ivory-200 my-1" />
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                  navigate("/");
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors text-left"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;
