import React, { useState } from "react";
import {
  Activity,
  Globe,
  UserCheck,
  UserX,
  Laptop,
  Smartphone,
  Trash2,
  Search,
  X,
  Clock,
} from "lucide-react";

export default function AdminAnalytics({
  visitorStats = { totalViews: 0, loggedInCount: 0, guestCount: 0, uniqueIps: 0 },
  visitorLogs = [],
  onClearLogs,
}) {
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Aggregate top pages from actual logs
  const pageCounts = {};
  visitorLogs.forEach((log) => {
    const page = log.pageVisited || "/";
    pageCounts[page] = (pageCounts[page] || 0) + 1;
  });

  const sortedPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Aggregate device breakdown from actual logs
  let desktopCount = 0;
  let mobileCount = 0;
  visitorLogs.forEach((log) => {
    const d = (log.device || "").toLowerCase();
    if (d.includes("mobile") || d.includes("phone") || d.includes("android") || d.includes("iphone")) {
      mobileCount++;
    } else {
      desktopCount++;
    }
  });

  const totalLogs = visitorLogs.length || 1;
  const loggedInPct = Math.round(((visitorStats.loggedInCount || 0) / totalLogs) * 100);
  const guestPct = Math.round(((visitorStats.guestCount || 0) / totalLogs) * 100);

  // Filter logs
  const filteredLogs = visitorLogs.filter((log) => {
    if (typeFilter === "loggedin" && !log.isLoggedIn) return false;
    if (typeFilter === "guest" && log.isLoggedIn) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (log.userName && log.userName.toLowerCase().includes(q)) ||
      (log.userEmail && log.userEmail.toLowerCase().includes(q)) ||
      (log.pageVisited && log.pageVisited.toLowerCase().includes(q)) ||
      (log.pageTitle && log.pageTitle.toLowerCase().includes(q)) ||
      (log.ipAddress && log.ipAddress.toLowerCase().includes(q)) ||
      (log.userRole && log.userRole.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Views */}
        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Page Impressions
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-heading font-extrabold text-[#172B3A] tracking-tight mt-2">
            {visitorStats.totalViews || visitorLogs.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Recorded via live visitor logging</p>
        </div>

        {/* Logged-In Views */}
        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Authenticated Views
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#315C4B]/10 text-[#315C4B] flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-heading font-extrabold text-[#172B3A] tracking-tight">
              {visitorStats.loggedInCount}
            </span>
            <span className="text-xs font-semibold text-[#315C4B]">
              {loggedInPct}% of total
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Logged-in buyers, agents, sellers</p>
        </div>

        {/* Guest Views */}
        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Anonymous Guest Views
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-heading font-extrabold text-[#172B3A] tracking-tight">
              {visitorStats.guestCount}
            </span>
            <span className="text-xs font-semibold text-amber-700">
              {guestPct}% of total
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Unauthenticated marketplace visitors</p>
        </div>

        {/* Unique IPs */}
        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Distinct Client Addresses
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#D5AD72]/15 text-[#9E7E4B] flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-heading font-extrabold text-[#172B3A] tracking-tight mt-2">
            {visitorStats.uniqueIps}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Unique remote IP addresses recorded</p>
        </div>
      </div>

      {/* Real Historical Aggregations: Top Visited Routes & Device Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Visited Pages */}
        <div className="p-5 rounded-lg bg-white border border-slate-200 shadow-xs space-y-4">
          <div>
            <h2 className="font-heading font-bold text-sm text-[#172B3A]">
              Frequently Traversed Pages
            </h2>
            <p className="text-[11px] text-slate-500">
              Aggregated from authentic page request logs.
            </p>
          </div>

          {sortedPages.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No page impression data recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {sortedPages.map(([page, count]) => {
                const pct = Math.round((count / totalLogs) * 100);
                return (
                  <div key={page} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-sans">
                      <span className="font-mono text-slate-800 font-medium truncate max-w-[240px]">
                        {page}
                      </span>
                      <span className="text-slate-600 font-semibold shrink-0">
                        {count} views ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#315C4B] rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Device & Client Breakdown */}
        <div className="p-5 rounded-lg bg-white border border-slate-200 shadow-xs space-y-4">
          <div>
            <h2 className="font-heading font-bold text-sm text-[#172B3A]">
              Audience & Device Distribution
            </h2>
            <p className="text-[11px] text-slate-500">
              Browser environment signatures logged in MongoDB Atlas.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-lg bg-[#F7F5F0] border border-[#E8E4DB] space-y-1.5">
              <div className="flex items-center gap-2 text-slate-700">
                <Laptop className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-semibold">Desktop</span>
              </div>
              <p className="text-xl font-heading font-bold text-slate-900">{desktopCount}</p>
              <p className="text-[10px] text-slate-500">
                {Math.round((desktopCount / totalLogs) * 100)}% of traffic
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#F7F5F0] border border-[#E8E4DB] space-y-1.5">
              <div className="flex items-center gap-2 text-slate-700">
                <Smartphone className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-semibold">Mobile</span>
              </div>
              <p className="text-xl font-heading font-bold text-slate-900">{mobileCount}</p>
              <p className="text-[10px] text-slate-500">
                {Math.round((mobileCount / totalLogs) * 100)}% of traffic
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span>Authentication Ratio:</span>
              <span className="font-semibold text-slate-800">
                {visitorStats.loggedInCount} Registered / {visitorStats.guestCount} Guests
              </span>
            </div>
            <div className="h-2 w-full bg-slate-200 rounded-full flex overflow-hidden">
              <div
                className="bg-[#315C4B] h-full"
                style={{ width: `${loggedInPct}%` }}
                title={`Logged in: ${loggedInPct}%`}
              />
              <div
                className="bg-amber-500 h-full"
                style={{ width: `${guestPct}%` }}
                title={`Guests: ${guestPct}%`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Live Visitor Logs Section */}
      <div className="space-y-4">
        {/* Controls: Filter Tabs, Search & Clear Logs Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-lg">
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                typeFilter === "all"
                  ? "bg-[#172B3A] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              All Records ({visitorLogs.length})
            </button>
            <button
              onClick={() => setTypeFilter("loggedin")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                typeFilter === "loggedin"
                  ? "bg-[#172B3A] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Logged-In Users ({visitorStats.loggedInCount})
            </button>
            <button
              onClick={() => setTypeFilter("guest")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                typeFilter === "guest"
                  ? "bg-[#172B3A] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Guest Visitors ({visitorStats.guestCount})
            </button>
          </div>

          {visitorLogs.length > 0 && (
            <button
              onClick={onClearLogs}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1.5 shrink-0"
              title="Clear all stored visitor logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Visitor Logs</span>
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-xs flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search logs by IP address, user name, email, page visited, or title..."
            className="w-full text-xs text-slate-900 placeholder-slate-400 bg-transparent outline-none font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-slate-400 hover:text-slate-600 p-1"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F5F0] border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">User / Identity</th>
                  <th className="py-3 px-4">Page Requested</th>
                  <th className="py-3 px-4">IP Address & Client</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 px-4 text-center text-slate-400">
                      <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-600">No visitor logs match your filter</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {searchQuery
                          ? "Try clearing your search term."
                          : "Visitor page visits will appear here in real-time."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const logId = log._id || log.id || Math.random();

                    return (
                      <tr key={logId} className="hover:bg-slate-50/60 transition-colors">
                        {/* Classification */}
                        <td className="py-3 px-4">
                          {log.isLoggedIn ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#315C4B]/10 text-[#315C4B] border border-[#315C4B]/20">
                              <UserCheck className="w-3 h-3" />
                              <span>Logged-In</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              <UserX className="w-3 h-3" />
                              <span>Guest Visitor</span>
                            </span>
                          )}
                        </td>

                        {/* Identity */}
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-900 truncate">
                            {log.userName || "Guest Visitor"}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                            <span className="truncate">{log.userEmail || "Anonymous"}</span>
                            {log.userRole && (
                              <span className="px-1 py-0.2 rounded bg-slate-100 text-[9px] font-semibold uppercase text-slate-600">
                                {log.userRole}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Page Requested */}
                        <td className="py-3 px-4">
                          <p className="font-mono text-slate-900 font-medium truncate max-w-xs">
                            {log.pageVisited || "/"}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">
                            {log.pageTitle || "HomeHub Real Estate"}
                          </p>
                        </td>

                        {/* IP & Device */}
                        <td className="py-3 px-4 text-slate-600">
                          <p className="font-mono font-medium text-slate-800">
                            {log.ipAddress || "127.0.0.1"}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                            {log.device || "Web Browser"}
                          </p>
                        </td>

                        {/* Timestamp */}
                        <td className="py-3 px-4 text-right text-slate-600 whitespace-nowrap">
                          <div className="inline-flex items-center gap-1 font-medium text-slate-800">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>
                              {log.createdAt
                                ? new Date(log.createdAt).toLocaleTimeString("en-IN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                  })
                                : "Just now"}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {log.createdAt
                              ? new Date(log.createdAt).toLocaleDateString("en-IN")
                              : ""}
                          </p>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-4 py-3 bg-[#F7F5F0] border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>
              Showing <strong className="text-slate-800">{filteredLogs.length}</strong> of{" "}
              <strong className="text-slate-800">{visitorLogs.length}</strong> log events
            </span>
            {typeFilter !== "all" && (
              <button
                onClick={() => setTypeFilter("all")}
                className="text-[#315C4B] hover:underline font-medium text-[11px]"
              >
                Show All Log Types
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
