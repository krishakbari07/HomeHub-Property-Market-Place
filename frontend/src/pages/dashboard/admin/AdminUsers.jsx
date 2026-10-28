import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  X,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function AdminUsers({
  users = [],
  onOpenUserModal,
  onChangeRole,
  onDeleteUser,
}) {
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const roleCategories = [
    { key: "all", label: "All Users", count: users.length },
    { key: "agent", label: "Agents", count: users.filter((u) => u.role?.toLowerCase() === "agent").length },
    { key: "seller", label: "Sellers", count: users.filter((u) => u.role?.toLowerCase() === "seller").length },
    { key: "buyer", label: "Buyers", count: users.filter((u) => u.role?.toLowerCase() === "buyer").length },
    {
      key: "rental",
      label: "Tenants",
      count: users.filter((u) => ["rental", "renter"].includes(u.role?.toLowerCase())).length,
    },
    { key: "admin", label: "Administrators", count: users.filter((u) => u.role?.toLowerCase() === "admin").length },
  ];

  // Filtering
  const filteredUsers = users.filter((user) => {
    // Role filter
    if (roleFilter !== "all") {
      const uRole = (user.role || "").toLowerCase();
      if (roleFilter === "rental") {
        if (!["rental", "renter"].includes(uRole)) return false;
      } else if (uRole !== roleFilter) {
        return false;
      }
    }

    // Search query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (user.name && user.name.toLowerCase().includes(q)) ||
      (user.email && user.email.toLowerCase().includes(q)) ||
      (user.phone && user.phone.toLowerCase().includes(q)) ||
      (user.agencyName && user.agencyName.toLowerCase().includes(q)) ||
      (user.preferredCity && user.preferredCity.toLowerCase().includes(q)) ||
      (user.role && user.role.toLowerCase().includes(q))
    );
  });

  const getRoleBadge = (role) => {
    const r = (role || "buyer").toLowerCase();
    switch (r) {
      case "admin":
        return "bg-[#172B3A] text-white border-[#243E53]";
      case "agent":
        return "bg-purple-50 text-purple-800 border-purple-200";
      case "seller":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "rental":
      case "renter":
        return "bg-teal-50 text-teal-800 border-teal-200";
      case "buyer":
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Controls: Role Filter Tabs & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Role Segmented Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-lg overflow-x-auto max-w-full">
          {roleCategories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setRoleFilter(cat.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                roleFilter === cat.key
                  ? "bg-[#172B3A] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  roleFilter === cat.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={() => onOpenUserModal(null, roleFilter === "all" ? "buyer" : roleFilter)}
          className="px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-[#315C4B] hover:bg-[#254538] transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New User</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by name, email, phone number, city, or agency..."
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

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F5F0] border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Location & Profile</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 px-4 text-center text-slate-400">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">No matching user records found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {searchQuery
                        ? "Try clearing your search query or switching role tabs."
                        : "Click '+ Add New User' to create an account."}
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="mt-3 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors"
                      >
                        Reset Search
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const uid = user._id || user.id;
                  const isAgent = user.role?.toLowerCase() === "agent";

                  return (
                    <tr key={uid} className="hover:bg-slate-50/60 transition-colors">
                      {/* User Name & Initial */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                            {user.name?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">
                              {user.name}
                            </p>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              ID: {String(uid).substring(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5 text-slate-600">
                          <p className="flex items-center gap-1.5 truncate">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </p>
                          {user.phone && (
                            <p className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{user.phone}</span>
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Role Badge & Quick Change */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={user.role ? user.role.toLowerCase() : "buyer"}
                            onChange={(e) => onChangeRole(uid, e.target.value)}
                            className={`text-[11px] font-semibold px-2 py-1 rounded-md border capitalize outline-none cursor-pointer ${getRoleBadge(
                              user.role
                            )}`}
                            title="Change user role"
                          >
                            <option value="buyer">Buyer</option>
                            <option value="rental">Rental</option>
                            <option value="seller">Seller</option>
                            <option value="agent">Agent</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      </td>

                      {/* Location / Agency Details */}
                      <td className="py-3 px-4 text-slate-600">
                        {isAgent ? (
                          <div className="space-y-0.5">
                            <p className="font-semibold text-slate-800 truncate">
                              {user.agencyName || "Independent Broker"}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate">
                              RERA: {user.reraId || "Registered"}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <p className="flex items-center gap-1 text-slate-700">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{user.preferredCity || "Ahmedabad"}</span>
                            </p>
                            {user.budgetRange && (
                              <p className="text-[10px] text-slate-500">
                                Budget: {user.budgetRange}
                              </p>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => onOpenUserModal(user)}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                            title="Edit user details"
                            aria-label={`Edit ${user.name}`}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteUser(uid, user.name, user.role)}
                            className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Delete user"
                            aria-label={`Delete ${user.name}`}
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

        {/* Table Footer Count */}
        <div className="px-4 py-3 bg-[#F7F5F0] border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>
            Showing <strong className="text-slate-800">{filteredUsers.length}</strong> of{" "}
            <strong className="text-slate-800">{users.length}</strong> accounts
          </span>
          {roleFilter !== "all" && (
            <button
              onClick={() => setRoleFilter("all")}
              className="text-[#315C4B] hover:underline font-medium text-[11px]"
            >
              Clear Role Filter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
