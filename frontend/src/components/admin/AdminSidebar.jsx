import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  MessageSquare,
  Activity,
  Settings,
  Tag,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AdminSidebar({
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
  counts = {},
}) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const currentPath = location.pathname;

  const navGroups = [
    {
      label: "OVERVIEW",
      items: [
        {
          name: "Dashboard",
          path: "/admin/dashboard",
          aliases: ["/admin", "/dashboard/admin"],
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: "MANAGEMENT",
      items: [
        {
          name: "Users",
          path: "/admin/users",
          icon: Users,
          count: counts.users,
        },
        {
          name: "Properties",
          path: "/admin/properties",
          icon: Building2,
          count: counts.properties,
        },
      ],
    },
    {
      label: "OPERATIONS",
      items: [
        {
          name: "Appointments",
          path: "/admin/appointments",
          icon: CalendarCheck,
          count: counts.appointments,
        },
        {
          name: "Inquiries",
          path: "/admin/inquiries",
          icon: MessageSquare,
          count: counts.inquiries,
        },
        {
          name: "Offers & Bids",
          path: "/admin/offers",
          icon: Tag,
          count: counts.offers,
        },
      ],
    },
    {
      label: "INSIGHTS",
      items: [
        {
          name: "Visitor Analytics",
          path: "/admin/analytics",
          aliases: ["/admin/visitors"],
          icon: Activity,
          count: counts.visitors,
        },
      ],
    },
    {
      label: "SYSTEM",
      items: [
        {
          name: "Settings",
          path: "/admin/settings",
          icon: Settings,
        },
      ],
    },
  ];

  const isItemActive = (item) => {
    if (currentPath === item.path) return true;
    if (item.aliases && item.aliases.includes(currentPath)) return true;
    return false;
  };

  const handleLinkClick = () => {
    if (mobileOpen && onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#172B3A] text-slate-100 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#243E53] shrink-0">
        <Link
          to="/admin/dashboard"
          onClick={handleLinkClick}
          className="flex items-center gap-3 overflow-hidden"
          title="HomeHub Administration"
        >
          <div className="w-9 h-9 rounded-lg bg-[#243E53] border border-[#31536E] flex items-center justify-center shrink-0 text-[#D5AD72]">
            <Building2 className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <span className="font-heading font-extrabold text-base tracking-tight text-white block">
                HomeHub
              </span>
              <span className="text-[10px] font-semibold text-[#D5AD72] tracking-wider uppercase block">
                ADMINISTRATION
              </span>
            </div>
          )}
        </Link>

        {/* Mobile close button */}
        {mobileOpen && (
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors lg:hidden"
            aria-label="Close navigation drawer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Desktop collapse toggle */}
        {!mobileOpen && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            {!collapsed && (
              <div className="px-3 pb-1 text-[11px] font-semibold text-slate-400 tracking-wider">
                {group.label}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleLinkClick}
                  title={collapsed ? item.name : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-colors relative group ${
                    active
                      ? "bg-[#315C4B] text-white font-semibold shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-white/5 font-medium"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      active ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                    }`}
                  />
                  {!collapsed && (
                    <span className="flex-1 truncate">{item.name}</span>
                  )}
                  {!collapsed && typeof item.count === "number" && item.count > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        active
                          ? "bg-white/20 text-white"
                          : "bg-[#243E53] text-slate-300 group-hover:text-white"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer / User Profile & Actions */}
      <div className="p-3 border-t border-[#243E53] shrink-0 space-y-1">
        {/* Public marketplace shortcut */}
        <Link
          to="/"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
          title="Visit Public Website"
        >
          <ExternalLink className="w-4 h-4 shrink-0 text-slate-400" />
          {!collapsed && <span className="truncate">Public Website</span>}
        </Link>

        {/* Administrator profile preview */}
        {!collapsed ? (
          <div className="p-2.5 mt-2 rounded-lg bg-[#203749] border border-[#2B475D] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-md bg-[#315C4B] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user?.name?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="min-w-0 leading-tight">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.name || "Administrator"}
                </p>
                <p className="text-[10px] text-[#D5AD72] truncate">
                  System Admin
                </p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              title="Sign Out"
              aria-label="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed/Sticky) */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 border-r border-[#243E53] transition-all duration-200 sticky top-0 h-screen z-30 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Responsive overlay) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#172B3A] shadow-xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
