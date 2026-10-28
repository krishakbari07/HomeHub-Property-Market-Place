import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarCheck,
  Search,
  X,
  Trash2,
  Clock,
  Building2,
  Mail,
  ExternalLink,
} from "lucide-react";

export default function AdminAppointments({
  appointments = [],
  onUpdateStatus,
  onDeleteAppointment,
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const pendingCount = appointments.filter(
    (a) => (a.status || "pending").toLowerCase() === "pending"
  ).length;
  const confirmedCount = appointments.filter(
    (a) => (a.status || "").toLowerCase() === "confirmed"
  ).length;
  const cancelledCount = appointments.filter(
    (a) => (a.status || "").toLowerCase() === "cancelled"
  ).length;

  const filteredAppointments = appointments.filter((apt) => {
    // Status filter
    if (statusFilter !== "all") {
      const s = (apt.status || "pending").toLowerCase();
      if (s !== statusFilter.toLowerCase()) return false;
    }

    // Search query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (apt.userName && apt.userName.toLowerCase().includes(q)) ||
      (apt.userEmail && apt.userEmail.toLowerCase().includes(q)) ||
      (apt.propertyTitle && apt.propertyTitle.toLowerCase().includes(q)) ||
      (apt.agentName && apt.agentName.toLowerCase().includes(q)) ||
      (apt.date && String(apt.date).toLowerCase().includes(q))
    );
  });

  const getStatusBadge = (status) => {
    const s = (status || "pending").toLowerCase();
    switch (s) {
      case "confirmed":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "completed":
        return "bg-[#172B3A] text-white border-[#243E53]";
      case "cancelled":
        return "bg-rose-50 text-rose-800 border-rose-200";
      case "pending":
      default:
        return "bg-amber-50 text-amber-800 border-amber-200";
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-lg overflow-x-auto max-w-full">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              statusFilter === "all"
                ? "bg-[#172B3A] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <span>All Visits</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                statusFilter === "all" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              {appointments.length}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              statusFilter === "pending"
                ? "bg-[#172B3A] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <span>Pending Confirmation</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                statusFilter === "pending"
                  ? "bg-white/20 text-white"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {pendingCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter("confirmed")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              statusFilter === "confirmed"
                ? "bg-[#172B3A] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <span>Confirmed</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                statusFilter === "confirmed"
                  ? "bg-white/20 text-white"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {confirmedCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter("cancelled")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              statusFilter === "cancelled"
                ? "bg-[#172B3A] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <span>Cancelled</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                statusFilter === "cancelled"
                  ? "bg-white/20 text-white"
                  : "bg-rose-100 text-rose-700"
              }`}
            >
              {cancelledCount}
            </span>
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by client name, email, property title, or assigned agent..."
          className="w-full text-xs text-slate-900 placeholder-slate-400 bg-transparent outline-none font-sans"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-slate-400 hover:text-slate-600 p-1"
            title="Clear filter"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F5F0] border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Property Visit</th>
                <th className="py-3 px-4">Assigned Advisor</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 px-4 text-center text-slate-400">
                    <CalendarCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">No appointments found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {searchQuery || statusFilter !== "all"
                        ? "Try resetting filters or search query."
                        : "Scheduled property appointments from buyers will appear here."}
                    </p>
                    {(searchQuery || statusFilter !== "all") && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setStatusFilter("all");
                        }}
                        className="mt-3 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors"
                      >
                        Reset Filter
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => {
                  const aid = apt._id || apt.id;
                  const propId = apt.property?._id || apt.property?.id || apt.property;
                  const currentStatus = (apt.status || "pending").toLowerCase();

                  return (
                    <tr key={aid} className="hover:bg-slate-50/60 transition-colors">
                      {/* Client */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                            {apt.userName?.[0]?.toUpperCase() || "C"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">
                              {apt.userName || "Client"}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{apt.userEmail}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Property */}
                      <td className="py-3 px-4">
                        <div className="min-w-0 max-w-xs">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-[#315C4B] shrink-0" />
                            <p className="font-semibold text-slate-800 truncate">
                              {apt.propertyTitle || apt.property?.title || "Property Visit"}
                            </p>
                            {propId && (
                              <Link
                                to={`/property/${propId}`}
                                target="_blank"
                                className="text-slate-400 hover:text-slate-700"
                                title="View property"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            )}
                          </div>
                          {apt.location && (
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {apt.location}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Assigned Agent */}
                      <td className="py-3 px-4 text-slate-700">
                        <p className="font-medium truncate">
                          {apt.agentName || apt.agent?.name || "Assigned Broker"}
                        </p>
                        {apt.agent?.phone && (
                          <p className="text-[10px] text-slate-400 truncate">
                            {apt.agent.phone}
                          </p>
                        )}
                      </td>

                      {/* Date & Time */}
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{apt.date || apt.appointmentDate || "Date TBD"}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {apt.time || apt.appointmentTime || "Time TBD"}
                        </p>
                      </td>

                      {/* Status Selector */}
                      <td className="py-3 px-4">
                        <select
                          value={currentStatus}
                          onChange={(e) => onUpdateStatus(aid, e.target.value)}
                          className={`text-[11px] font-semibold px-2 py-1 rounded-md border capitalize outline-none cursor-pointer ${getStatusBadge(
                            currentStatus
                          )}`}
                          title="Update appointment status"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      {/* Delete Action */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onDeleteAppointment(aid)}
                          className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete appointment"
                          aria-label="Delete appointment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-[#F7F5F0] border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>
            Showing <strong className="text-slate-800">{filteredAppointments.length}</strong> of{" "}
            <strong className="text-slate-800">{appointments.length}</strong> appointments
          </span>
          {statusFilter !== "all" && (
            <button
              onClick={() => setStatusFilter("all")}
              className="text-[#315C4B] hover:underline font-medium text-[11px]"
            >
              Show All Visits
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
