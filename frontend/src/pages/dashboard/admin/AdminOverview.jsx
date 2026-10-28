import React from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Building2,
  CalendarCheck,
  MessageSquare,
  Activity,
  Plus,
  ArrowRight,
  Eye,
  Clock,
  MapPin,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export default function AdminOverview({
  users = [],
  properties = [],
  appointments = [],
  inquiries = [],
  visitorStats = { totalViews: 0, loggedInCount: 0, guestCount: 0, uniqueIps: 0 },
  loading = false,
  error = "",
  onOpenUserModal,
  onOpenPropertyModal,
  onSelectInquiry,
}) {
  // Calculations
  const agentsCount = users.filter((u) => u.role?.toLowerCase() === "agent").length;
  const sellersCount = users.filter((u) => u.role?.toLowerCase() === "seller").length;
  const buyersCount = users.filter((u) => u.role?.toLowerCase() === "buyer").length;
  const rentersCount = users.filter((u) => ["rental", "renter"].includes(u.role?.toLowerCase())).length;

  const buyProps = properties.filter((p) =>
    ["buy", "sale", "for sale"].includes((p.purpose || p.listingType || "buy").toLowerCase())
  );
  const rentProps = properties.filter((p) =>
    ["rent", "rental", "for rent"].includes((p.purpose || p.listingType || "").toLowerCase())
  );

  const pendingAppointments = appointments.filter(
    (a) => (a.status || "pending").toLowerCase() === "pending"
  ).length;
  const confirmedAppointments = appointments.filter(
    (a) => (a.status || "").toLowerCase() === "confirmed"
  ).length;

  const pendingInquiries = inquiries.filter(
    (i) => (i.status || "pending").toLowerCase() === "pending"
  ).length;
  const respondedInquiries = inquiries.filter(
    (i) => (i.status || "").toLowerCase() === "responded"
  ).length;

  // Portfolio valuation calculation
  const totalWorth = properties.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
  const formattedWorth =
    totalWorth >= 10000000
      ? `₹ ${(totalWorth / 10000000).toFixed(2)} Cr`
      : `₹ ${(totalWorth / 100000).toFixed(2)} Lakh`;

  // Recent items
  const recentInquiries = inquiries.slice(0, 4);
  const recentAppointments = appointments.slice(0, 4);
  const recentProperties = properties.slice(0, 4);

  if (loading && users.length === 0 && properties.length === 0) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-lg border border-slate-200" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-white rounded-lg border border-slate-200" />
          <div className="h-72 bg-white rounded-lg border border-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error alert if any */}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Registered Users
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-heading font-extrabold text-[#172B3A] tracking-tight">
              {users.length}
            </span>
            <div className="flex flex-wrap gap-1 mt-1.5 text-[10px] text-slate-500">
              <span className="px-1.5 py-0.5 rounded bg-slate-100 font-medium">
                {agentsCount} Agents
              </span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 font-medium">
                {sellersCount} Sellers
              </span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 font-medium">
                {buyersCount} Buyers
              </span>
              {rentersCount > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-slate-100 font-medium">
                  {rentersCount} Tenants
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Properties Listed */}
        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Marketplace Properties
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#315C4B]/10 text-[#315C4B] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-heading font-extrabold text-[#172B3A] tracking-tight">
                {properties.length}
              </span>
              <span className="text-[11px] font-semibold text-[#D5AD72]">
                {formattedWorth}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {buyProps.length} For Sale • {rentProps.length} For Rent
            </p>
          </div>
        </div>

        {/* Scheduled Appointments */}
        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Visit Appointments
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#D5AD72]/15 text-[#9E7E4B] flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-heading font-extrabold text-[#172B3A] tracking-tight">
              {appointments.length}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">
              <span className="font-semibold text-amber-700">{pendingAppointments} Pending</span> •{" "}
              <span className="font-semibold text-emerald-700">{confirmedAppointments} Confirmed</span>
            </p>
          </div>
        </div>

        {/* Visitor Inquiries */}
        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Client Inquiries
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-[#172B3A] flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-heading font-extrabold text-[#172B3A] tracking-tight">
              {inquiries.length}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">
              <span className="font-semibold text-amber-700">{pendingInquiries} Pending</span> •{" "}
              <span className="font-semibold text-slate-700">{respondedInquiries} Responded</span>
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action Control Strip */}
      <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <ShieldCheck className="w-4 h-4 text-[#315C4B]" />
          <span>Quick Administrative Actions</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onOpenUserModal(null, "buyer")}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#315C4B] hover:bg-[#254538] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add User</span>
          </button>
          <button
            onClick={() => onOpenPropertyModal(null, "buy")}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#172B3A] bg-[#F7F5F0] hover:bg-[#EDE8DE] border border-[#E8E4DB] transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Property</span>
          </button>
          <Link
            to="/admin/analytics"
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
          >
            <Activity className="w-3.5 h-3.5 text-slate-500" />
            <span>Traffic Analytics ({visitorStats.totalViews})</span>
          </Link>
        </div>
      </div>

      {/* Operational Grids: Recent Inquiries & Recent Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Inquiries Card */}
        <div className="rounded-lg bg-white border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="font-heading font-bold text-sm text-[#172B3A]">
                Recent Inquiries & Leads
              </h2>
              <p className="text-[11px] text-slate-500">
                Latest client messages submitted for listed properties.
              </p>
            </div>
            <Link
              to="/admin/inquiries"
              className="text-xs font-medium text-[#315C4B] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 flex-1">
            {recentInquiries.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs">
                No inquiries recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 space-y-2">
                {recentInquiries.map((inq) => {
                  const inqId = inq._id || inq.id;
                  const isPending = (inq.status || "Pending").toLowerCase() === "pending";

                  return (
                    <div
                      key={inqId}
                      className="pt-2 first:pt-0 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900 truncate">
                            {inq.userName || "Guest Visitor"}
                          </p>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              isPending
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {inq.status || "Pending"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {inq.propertyTitle || inq.property?.title || "General Inquiry"}
                        </p>
                        <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5 italic">
                          "{inq.message}"
                        </p>
                      </div>

                      <div className="flex flex-col items-end shrink-0 gap-1.5">
                        <span className="text-[10px] text-slate-400">
                          {inq.createdAt
                            ? new Date(inq.createdAt).toLocaleDateString("en-IN")
                            : "Recent"}
                        </span>
                        <button
                          onClick={() => onSelectInquiry(inq)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Appointments Card */}
        <div className="rounded-lg bg-white border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="font-heading font-bold text-sm text-[#172B3A]">
                Upcoming Site Appointments
              </h2>
              <p className="text-[11px] text-slate-500">
                Scheduled property viewings booked with brokers.
              </p>
            </div>
            <Link
              to="/admin/appointments"
              className="text-xs font-medium text-[#315C4B] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 flex-1">
            {recentAppointments.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs">
                No site appointments scheduled.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 space-y-2">
                {recentAppointments.map((apt) => {
                  const aptId = apt._id || apt.id;
                  const isPending = (apt.status || "pending").toLowerCase() === "pending";

                  return (
                    <div
                      key={aptId}
                      className="pt-2 first:pt-0 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900 truncate">
                            {apt.userName || "Client"}
                          </p>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize ${
                              isPending
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {apt.status || "pending"}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#315C4B] font-medium truncate mt-0.5">
                          {apt.propertyTitle || apt.property?.title || "Property Visit"}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          Advisor: {apt.agentName || apt.agent?.name || "Assigned Broker"}
                        </p>
                      </div>

                      <div className="flex flex-col items-end shrink-0 text-right">
                        <div className="flex items-center gap-1 text-[11px] text-slate-700 font-medium">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{apt.date || apt.appointmentDate || "Date TBD"}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          {apt.time || apt.appointmentTime || "Time TBD"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Properties Row */}
      <div className="rounded-lg bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="font-heading font-bold text-sm text-[#172B3A]">
              Latest Listed Properties
            </h2>
            <p className="text-[11px] text-slate-500">
              Verified inventory actively syndicated on the marketplace.
            </p>
          </div>
          <Link
            to="/admin/properties"
            className="text-xs font-medium text-[#315C4B] hover:underline flex items-center gap-1"
          >
            <span>All Properties</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-4">
          {recentProperties.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No properties listed yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentProperties.map((prop) => {
                const propId = prop._id || prop.id;
                const isRent = ["rent", "rental", "for rent"].includes(
                  (prop.purpose || prop.listingType || "").toLowerCase()
                );

                return (
                  <div
                    key={propId}
                    className="rounded-lg border border-slate-200 overflow-hidden hover:border-slate-300 transition-colors flex flex-col"
                  >
                    <div className="h-32 bg-slate-100 relative overflow-hidden">
                      <img
                        src={prop.image || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80"}
                        alt={prop.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <span
                        className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                          isRent
                            ? "bg-slate-900/80 text-white"
                            : "bg-[#315C4B]/90 text-white"
                        }`}
                      >
                        {isRent ? "Rent" : "Buy"}
                      </span>
                    </div>

                    <div className="p-3 flex-1 flex flex-col justify-between text-xs space-y-2">
                      <div>
                        <p className="font-semibold text-slate-900 line-clamp-1">
                          {prop.title}
                        </p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{prop.location}, {prop.city}</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="font-heading font-bold text-sm text-[#172B3A]">
                          {prop.formattedPrice || `₹ ${Number(prop.price).toLocaleString("en-IN")}`}
                        </span>
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                            prop.status === "Sold" || prop.status === "Rented"
                              ? "bg-rose-50 text-rose-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {prop.status || "Available"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
