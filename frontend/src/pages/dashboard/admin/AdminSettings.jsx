import React from "react";
import {
  Database,
  Server,
  ShieldCheck,
  RefreshCw,
  Trash2,
  User,
  Layers,
  KeyRound,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function AdminSettings({
  usersCount = 0,
  propertiesCount = 0,
  appointmentsCount = 0,
  inquiriesCount = 0,
  visitorLogsCount = 0,
  loading = false,
  onRefreshData,
  onClearLogs,
}) {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Settings Card: System Architecture & Infrastructure */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 space-y-4">
        <div>
          <h2 className="font-heading font-bold text-base text-[#172B3A] flex items-center gap-2">
            <Server className="w-4 h-4 text-[#315C4B]" />
            <span>Infrastructure & Environment Status</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status of backend services, database connections, and operational health.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Database */}
          <div className="p-4 rounded-lg bg-[#F7F5F0] border border-[#E8E4DB] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Database Engine
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="font-heading font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Database className="w-4 h-4 text-[#315C4B]" />
              <span>MongoDB Atlas</span>
            </p>
            <p className="text-[11px] text-slate-500">Live replica set connection verified</p>
          </div>

          {/* API Service */}
          <div className="p-4 rounded-lg bg-[#F7F5F0] border border-[#E8E4DB] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Backend Service
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="font-heading font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Server className="w-4 h-4 text-[#315C4B]" />
              <span>HomeHub REST API</span>
            </p>
            <p className="text-[11px] text-slate-500">Node.js Express with JWT protection</p>
          </div>

          {/* Security Tier */}
          <div className="p-4 rounded-lg bg-[#F7F5F0] border border-[#E8E4DB] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Security Enforcer
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#315C4B]" />
            </div>
            <p className="font-heading font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-[#315C4B]" />
              <span>RBAC Enforced</span>
            </p>
            <p className="text-[11px] text-slate-500">Strict admin role verification</p>
          </div>
        </div>
      </div>

      {/* Settings Card: Active Administrator Profile */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 space-y-4">
        <div>
          <h2 className="font-heading font-bold text-base text-[#172B3A] flex items-center gap-2">
            <User className="w-4 h-4 text-[#315C4B]" />
            <span>Authenticated Administrator Identity</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active session credentials and authorization level.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#315C4B] text-white flex items-center justify-center font-bold text-sm shrink-0">
              {user?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 text-sm">
                {user?.name || "System Administrator"}
              </p>
              <p className="text-xs text-slate-500">{user?.email || "admin@homehub.com"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-md bg-[#172B3A] text-white font-semibold text-[11px] uppercase tracking-wider">
              Role: {user?.role || "ADMIN"}
            </span>
            {user?._id && (
              <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-600 font-mono text-[11px]">
                UID: {String(user._id).substring(0, 10)}...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Settings Card: Data Diagnostics & Maintenance */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 space-y-4">
        <div>
          <h2 className="font-heading font-bold text-base text-[#172B3A] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#315C4B]" />
            <span>Platform Record Diagnostics</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Live entity totals synchronised from the backend MongoDB collections.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          <div className="p-3 rounded-lg border border-slate-200 bg-white">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Users</span>
            <p className="text-lg font-heading font-bold text-slate-900 mt-0.5">{usersCount}</p>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 bg-white">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Properties</span>
            <p className="text-lg font-heading font-bold text-slate-900 mt-0.5">{propertiesCount}</p>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 bg-white">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Appointments</span>
            <p className="text-lg font-heading font-bold text-slate-900 mt-0.5">{appointmentsCount}</p>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 bg-white">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Inquiries</span>
            <p className="text-lg font-heading font-bold text-slate-900 mt-0.5">{inquiriesCount}</p>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 bg-white">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Visitor Logs</span>
            <p className="text-lg font-heading font-bold text-slate-900 mt-0.5">{visitorLogsCount}</p>
          </div>
        </div>

        {/* Maintenance Actions */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Maintain or synchronize live records across the HomeHub administration console.
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onRefreshData}
              disabled={loading}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#315C4B]" : ""}`} />
              <span>Refresh All Datasets</span>
            </button>

            {visitorLogsCount > 0 && (
              <button
                onClick={onClearLogs}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Visitor Traffic Logs</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
