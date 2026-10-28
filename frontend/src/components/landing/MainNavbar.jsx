import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Building2,
  LogOut,
  Menu,
  X,
  Sparkles,
  Heart,
  PlusCircle,
  LayoutDashboard,
  User,
  Settings,
  ChevronDown,
  Calendar,
  Shield,
  Layers,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useProperty } from "../../context/PropertyContext";
import NotificationBell from "../common/NotificationBell";

const MainNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { wishlistIds } = useProperty();

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

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setMobileMenuOpen(false);
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  const role = user?.role?.toLowerCase();

  const getDashboardPath = () => {
    if (!user) return "/login";
    switch (role) {
      case "admin":
        return "/admin/dashboard";
      case "seller":
        return "/seller/dashboard";
      case "agent":
        return "/agent/dashboard";
      case "buyer":
      case "renter":
      case "rental":
      default:
        return "/buyer/dashboard";
    }
  };

  const getProfilePath = () => {
    switch (role) {
      case "admin":
        return "/admin/settings";
      case "seller":
        return "/seller/profile";
      case "agent":
        return "/agent/profile";
      case "buyer":
      case "renter":
      case "rental":
      default:
        return "/buyer/profile";
    }
  };

  const getDashboardLabel = () => {
    if (role === "admin") return "Admin Console";
    return "Dashboard";
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-ivory-300/80 shadow-subtle transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo - Always links to Public Landing Page */}
          <Link to="/" className="flex items-center space-x-3 group" title="HomeHub Home">
            <div className="w-10 h-10 rounded-xl bg-navy-800 text-white flex items-center justify-center shadow-subtle border border-navy-700 group-hover:bg-navy-900 transition-colors">
              <Building2 className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <span className="text-2xl font-heading font-extrabold tracking-tight text-navy-800">
                Home<span className="text-forest-700">Hub</span>
              </span>
              <span className="block text-[10px] font-semibold text-navy-500 uppercase tracking-widest -mt-1">
                Real Estate Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Always accessible for both logged in and logged out users */}
          <nav className="hidden lg:flex items-center space-x-1">
            {/* 1. Home - Always present and active on '/' */}
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive("/")
                  ? "text-navy-900 font-bold bg-ivory-200/70 border-b-2 border-forest-700"
                  : "text-navy-700 hover:text-navy-950 hover:bg-ivory-100"
              }`}
            >
              Home
            </Link>

            {/* 2. Core Public Marketplace Links */}
            <Link
              to="/buy"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive("/buy")
                  ? "text-navy-900 font-bold bg-ivory-200/70 border-b-2 border-forest-700"
                  : "text-navy-700 hover:text-navy-950 hover:bg-ivory-100"
              }`}
            >
              Buy
            </Link>

            <Link
              to="/rent"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive("/rent")
                  ? "text-navy-900 font-bold bg-ivory-200/70 border-b-2 border-forest-700"
                  : "text-navy-700 hover:text-navy-950 hover:bg-ivory-100"
              }`}
            >
              Rent
            </Link>

            <Link
              to="/sell"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive("/sell")
                  ? "text-navy-900 font-bold bg-ivory-200/70 border-b-2 border-forest-700"
                  : "text-navy-700 hover:text-navy-950 hover:bg-ivory-100"
              }`}
            >
              Sell
            </Link>

            <Link
              to="/agents"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive("/agents")
                  ? "text-navy-900 font-bold bg-ivory-200/70 border-b-2 border-forest-700"
                  : "text-navy-700 hover:text-navy-950 hover:bg-ivory-100"
              }`}
            >
              Agents
            </Link>

            <Link
              to="/ai-recommendations"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-all ${
                isActive("/ai-recommendations")
                  ? "text-forest-800 font-bold bg-forest-100 border border-forest-200"
                  : "text-forest-700 bg-forest-50/80 border border-forest-100 hover:bg-forest-100"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-forest-700" />
              <span>AI Recommendations</span>
            </Link>

            {/* Role-specific contextual shortcuts in main nav when authenticated */}
            {isAuthenticated && (
              <>
                {role === "admin" && (
                  <Link
                    to="/admin/dashboard"
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-all ${
                      location.pathname.startsWith("/admin")
                        ? "text-forest-800 font-bold bg-forest-100 border border-forest-200"
                        : "text-navy-700 hover:text-navy-950 hover:bg-ivory-100"
                    }`}
                  >
                    <Shield className="w-4 h-4 text-forest-700" />
                    <span>Admin Console</span>
                  </Link>
                )}

                {role === "seller" && (
                  <Link
                    to="/seller/properties"
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      location.pathname.startsWith("/seller")
                        ? "text-forest-800 font-bold bg-forest-100"
                        : "text-navy-700 hover:text-navy-950 hover:bg-ivory-100"
                    }`}
                  >
                    My Properties
                  </Link>
                )}

                {role === "agent" && (
                  <Link
                    to="/agent/listings"
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      location.pathname.startsWith("/agent")
                        ? "text-forest-800 font-bold bg-forest-100"
                        : "text-navy-700 hover:text-navy-950 hover:bg-ivory-100"
                    }`}
                  >
                    Listings
                  </Link>
                )}

                {(role === "buyer" || role === "rental" || role === "renter") && (
                  <Link
                    to="/buyer/wishlist"
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-all ${
                      location.pathname === "/buyer/wishlist"
                        ? "text-forest-800 font-bold bg-forest-100"
                        : "text-navy-700 hover:text-navy-950 hover:bg-ivory-100"
                    }`}
                  >
                    <Heart className="w-4 h-4 text-forest-700" />
                    <span>Wishlist</span>
                    {wishlistIds?.length > 0 && (
                      <span className="w-4 h-4 rounded-full bg-forest-700 text-white text-[10px] flex items-center justify-center font-bold">
                        {wishlistIds.length}
                      </span>
                    )}
                  </Link>
                )}
              </>
            )}

            {/* Public Secondary Links */}
            <Link
              to="/about"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive("/about")
                  ? "text-navy-900 font-bold bg-ivory-200/70 border-b-2 border-forest-700"
                  : "text-navy-700 hover:text-navy-950 hover:bg-ivory-100"
              }`}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive("/contact")
                  ? "text-navy-900 font-bold bg-ivory-200/70 border-b-2 border-forest-700"
                  : "text-navy-700 hover:text-navy-950 hover:bg-ivory-100"
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Desktop Right CTA / User Panel */}
          <div className="hidden lg:flex items-center space-x-3">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-navy-800 hover:text-navy-950 hover:bg-ivory-100 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-forest-700 hover:bg-forest-800 text-white transition-all shadow-subtle border border-forest-800"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                {/* Notification Bell */}
                <NotificationBell />

                {/* 1. Account / Dashboard Link button (Explicit navigation) */}
                <Link
                  to={getDashboardPath()}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all bg-navy-800 text-white shadow-subtle hover:bg-navy-900 border border-navy-700"
                  title={`Open ${getDashboardLabel()}`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-gold-400" />
                  <span>{getDashboardLabel()}</span>
                </Link>

                {/* 2. User Profile Dropdown Menu */}
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-ivory-100 border border-ivory-300 hover:bg-ivory-200 transition-colors cursor-pointer"
                    aria-expanded={profileOpen}
                    aria-haspopup="true"
                    aria-label="User profile menu"
                  >
                    <div className="w-7 h-7 rounded-lg bg-navy-800 text-white flex items-center justify-center font-bold text-xs shadow-subtle">
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="text-left leading-tight pr-1">
                      <span className="block text-xs font-bold text-navy-900 truncate max-w-[110px]">
                        {user?.name || "User"}
                      </span>
                      <span className="block text-[10px] font-semibold text-forest-700 capitalize">
                        {user?.role || "Account"}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-navy-500 transition-transform duration-200 ${
                        profileOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu Panel */}
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-card border border-ivory-300 p-2 space-y-1 z-50 animate-fadeIn">
                      {/* User Identity Header */}
                      <div className="px-3 py-2.5 border-b border-ivory-200 bg-ivory-50/60 rounded-xl">
                        <p className="font-bold text-xs text-navy-900 truncate">
                          {user?.name || "User"}
                        </p>
                        <p className="text-[11px] text-navy-500 truncate">
                          {user?.email || ""}
                        </p>
                        <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md bg-forest-50 text-[10px] font-bold text-forest-700 border border-forest-200 capitalize">
                          {user?.role} Account
                        </span>
                      </div>

                      {/* Primary Navigation Actions */}
                      <div className="py-1 space-y-0.5">
                        <Link
                          to={getDashboardPath()}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-navy-800 hover:bg-ivory-100 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-forest-700" />
                          <span>Go to {getDashboardLabel()}</span>
                        </Link>

                        <Link
                          to={getProfilePath()}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-navy-800 hover:bg-ivory-100 transition-colors"
                        >
                          <User className="w-4 h-4 text-navy-500" />
                          <span>Profile & Account Settings</span>
                        </Link>

                        {/* Role-specific Quick Links */}
                        {(role === "buyer" || role === "rental" || role === "renter") && (
                          <Link
                            to="/buyer/wishlist"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-navy-800 hover:bg-ivory-100 transition-colors"
                          >
                            <Heart className="w-4 h-4 text-forest-700" />
                            <span>Saved Wishlist ({wishlistIds?.length || 0})</span>
                          </Link>
                        )}

                        {role === "seller" && (
                          <>
                            <Link
                              to="/seller/add-property"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-navy-800 hover:bg-ivory-100 transition-colors"
                            >
                              <PlusCircle className="w-4 h-4 text-forest-700" />
                              <span>Publish New Listing</span>
                            </Link>
                            <Link
                              to="/seller/properties"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-navy-800 hover:bg-ivory-100 transition-colors"
                            >
                              <Layers className="w-4 h-4 text-navy-500" />
                              <span>My Properties</span>
                            </Link>
                          </>
                        )}

                        {role === "agent" && (
                          <>
                            <Link
                              to="/agent/appointments"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-navy-800 hover:bg-ivory-100 transition-colors"
                            >
                              <Calendar className="w-4 h-4 text-forest-700" />
                              <span>Appointments</span>
                            </Link>
                            <Link
                              to="/agent/listings"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-navy-800 hover:bg-ivory-100 transition-colors"
                            >
                              <Layers className="w-4 h-4 text-navy-500" />
                              <span>My Portfolio</span>
                            </Link>
                          </>
                        )}

                        {role === "admin" && (
                          <Link
                            to="/admin/settings"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-navy-800 hover:bg-ivory-100 transition-colors"
                          >
                            <Settings className="w-4 h-4 text-navy-500" />
                            <span>System Settings</span>
                          </Link>
                        )}
                      </div>

                      {/* Divider & Sign Out */}
                      <div className="border-t border-ivory-200 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4 text-rose-600" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 text-navy-800 hover:bg-ivory-200 rounded-xl transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-ivory-300 px-6 py-6 space-y-4 animate-fadeIn">
          {/* User Status Header if Authenticated */}
          {isAuthenticated && (
            <div className="pb-4 border-b border-ivory-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-navy-800 text-white flex items-center justify-center font-bold text-sm shadow-subtle">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-navy-900 text-sm">{user?.name}</p>
                  <p className="text-xs text-forest-700 font-semibold capitalize">{user?.role} Account</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <NotificationBell isMobile={true} />
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 bg-navy-800 text-white text-xs font-bold rounded-lg"
                >
                  {getDashboardLabel()}
                </Link>
              </div>
            </div>
          )}

          {/* Complete Navigation Links for all users */}
          <div className="space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 text-sm font-semibold text-navy-800 border-b border-ivory-200"
            >
              Home
            </Link>
            <Link
              to="/buy"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 text-sm font-semibold text-navy-800 border-b border-ivory-200"
            >
              Buy
            </Link>
            <Link
              to="/rent"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 text-sm font-semibold text-navy-800 border-b border-ivory-200"
            >
              Rent
            </Link>
            <Link
              to="/sell"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 text-sm font-semibold text-navy-800 border-b border-ivory-200"
            >
              Sell
            </Link>
            <Link
              to="/agents"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 text-sm font-semibold text-navy-800 border-b border-ivory-200"
            >
              Agents
            </Link>
            <Link
              to="/ai-recommendations"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 text-sm font-semibold text-forest-700 border-b border-ivory-200"
            >
              AI Recommendations
            </Link>

            {/* Role-specific Mobile Links */}
            {isAuthenticated && (
              <>
                {(role === "buyer" || role === "rental" || role === "renter") && (
                  <Link
                    to="/buyer/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2.5 text-sm font-semibold text-navy-800 border-b border-ivory-200"
                  >
                    Wishlist ({wishlistIds?.length || 0})
                  </Link>
                )}
                {role === "seller" && (
                  <Link
                    to="/seller/properties"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2.5 text-sm font-semibold text-navy-800 border-b border-ivory-200"
                  >
                    My Properties
                  </Link>
                )}
                {role === "agent" && (
                  <Link
                    to="/agent/listings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2.5 text-sm font-semibold text-navy-800 border-b border-ivory-200"
                  >
                    My Listings
                  </Link>
                )}
                <Link
                  to={getProfilePath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2.5 text-sm font-semibold text-navy-800 border-b border-ivory-200"
                >
                  Profile & Account Settings
                </Link>
              </>
            )}

            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 text-sm font-semibold text-navy-800 border-b border-ivory-200"
            >
              About Us
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 text-sm font-semibold text-navy-800 border-b border-ivory-200"
            >
              Contact
            </Link>
          </div>

          {/* Footer Auth Buttons for Mobile */}
          {!isAuthenticated ? (
            <div className="pt-4 flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl border border-navy-200 font-semibold text-navy-800"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-forest-700 text-white font-semibold"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="pt-2">
              <button
                onClick={handleLogout}
                className="w-full text-left py-2.5 text-sm font-semibold text-rose-700 flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default MainNavbar;
