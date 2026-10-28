import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  Search,
  X,
  Eye,
  Trash2,
  Mail,
  Phone,
  Building2,
  Calendar,
  ExternalLink,
} from "lucide-react";

export default function AdminInquiries({
  inquiries = [],
  onUpdateStatus,
  onSelectInquiry,
  onDeleteInquiry,
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const pendingCount = inquiries.filter(
    (i) => (i.status || "Pending").toLowerCase() === "pending"
  ).length;
  const respondedCount = inquiries.filter(
    (i) => (i.status || "").toLowerCase() === "responded"
  ).length;
  const closedCount = inquiries.filter(
    (i) => (i.status || "").toLowerCase() === "closed"
  ).length;

  const filteredInquiries = inquiries.filter((inq) => {
    // Status filter
    if (statusFilter !== "all") {
      const s = (inq.status || "Pending").toLowerCase();
      if (s !== statusFilter.toLowerCase()) return false;
    }

    // Search query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (inq.userName && inq.userName.toLowerCase().includes(q)) ||
      (inq.userEmail && inq.userEmail.toLowerCase().includes(q)) ||
      (inq.userPhone && inq.userPhone.toLowerCase().includes(q)) ||
      (inq.propertyTitle && inq.propertyTitle.toLowerCase().includes(q)) ||
      (inq.message && inq.message.toLowerCase().includes(q))
    );
  });

  const getStatusBadge = (status) => {
    const s = (status || "Pending").toLowerCase();
    switch (s) {
      case "responded":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "closed":
        return "bg-slate-100 text-slate-700 border-slate-200";
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
            <span>All Inquiries</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                statusFilter === "all" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              {inquiries.length}
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
            <span>Pending Action</span>
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
            onClick={() => setStatusFilter("responded")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              statusFilter === "responded"
                ? "bg-[#172B3A] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <span>Responded</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                statusFilter === "responded"
                  ? "bg-white/20 text-white"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {respondedCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter("closed")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              statusFilter === "closed"
                ? "bg-[#172B3A] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <span>Closed</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                statusFilter === "closed"
                  ? "bg-white/20 text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {closedCount}
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
          placeholder="Search by visitor name, email, phone, property title, or requirement..."
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

      {/* Inquiries Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F5F0] border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Visitor</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Referenced Property</th>
                <th className="py-3 px-4">Message Excerpt</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 px-4 text-center text-slate-400">
                    <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">No inquiries found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {searchQuery || statusFilter !== "all"
                        ? "Try resetting your search query or status filter."
                        : "Buyer property inquiries from the public marketplace will appear here."}
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
                filteredInquiries.map((inq) => {
                  const inqId = inq._id || inq.id;
                  const propId = inq.property?._id || inq.property?.id || inq.property;
                  const currentStatus = inq.status || "Pending";

                  return (
                    <tr key={inqId} className="hover:bg-slate-50/60 transition-colors">
                      {/* Visitor */}
                      <td className="py-3 px-4">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">
                            {inq.userName || "Guest Visitor"}
                          </p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>
                              {inq.createdAt
                                ? new Date(inq.createdAt).toLocaleDateString("en-IN")
                                : "Recently"}
                            </span>
                          </p>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-4 text-slate-600">
                        <div className="space-y-0.5">
                          <p className="flex items-center gap-1.5 truncate">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{inq.userEmail}</span>
                          </p>
                          {inq.userPhone && (
                            <p className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{inq.userPhone}</span>
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Property */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 max-w-xs">
                          <Building2 className="w-3.5 h-3.5 text-[#315C4B] shrink-0" />
                          <span className="font-medium text-slate-800 truncate">
                            {inq.propertyTitle || inq.property?.title || "General Marketplace Inquiry"}
                          </span>
                          {propId && (
                            <Link
                              to={`/property/${propId}`}
                              target="_blank"
                              className="text-slate-400 hover:text-slate-700 shrink-0"
                              title="View property details"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </td>

                      {/* Message Excerpt */}
                      <td className="py-3 px-4 text-slate-600 max-w-xs">
                        <p className="line-clamp-2 italic">
                          "{inq.message || "No message content"}"
                        </p>
                      </td>

                      {/* Status Selector */}
                      <td className="py-3 px-4">
                        <select
                          value={currentStatus}
                          onChange={(e) => onUpdateStatus(inqId, e.target.value)}
                          className={`text-[11px] font-semibold px-2 py-1 rounded-md border outline-none cursor-pointer ${getStatusBadge(
                            currentStatus
                          )}`}
                          title="Update inquiry status"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Responded">Responded</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => onSelectInquiry(inq)}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-[#315C4B] hover:text-[#254538] transition-colors"
                            title="View inquiry details"
                            aria-label="View inquiry"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteInquiry(inqId)}
                            className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Delete inquiry"
                            aria-label="Delete inquiry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
            Showing <strong className="text-slate-800">{filteredInquiries.length}</strong> of{" "}
            <strong className="text-slate-800">{inquiries.length}</strong> inquiries
          </span>
          {statusFilter !== "all" && (
            <button
              onClick={() => setStatusFilter("all")}
              className="text-[#315C4B] hover:underline font-medium text-[11px]"
            >
              Show All Inquiries
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
