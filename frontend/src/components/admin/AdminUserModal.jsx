import React, { useState, useEffect } from "react";
import { X, Loader2, User, Mail, Lock, Phone, MapPin, Briefcase, FileBadge } from "lucide-react";

export default function AdminUserModal({
  isOpen = false,
  user = null,
  defaultRole = "buyer",
  loading = false,
  onSave,
  onClose,
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "buyer",
    phone: "",
    agencyName: "",
    reraId: "",
    region: "",
    preferredCity: "Ahmedabad",
    budgetRange: "",
  });
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        role: user.role ? user.role.toLowerCase() : "buyer",
        phone: user.phone || "",
        agencyName: user.agencyName || "",
        reraId: user.reraId || "",
        region: user.region || "",
        preferredCity: user.preferredCity || "Ahmedabad",
        budgetRange: user.budgetRange || (user.rentalBudget ? `₹ ${Number(user.rentalBudget).toLocaleString("en-IN")}/month` : ""),
      });
    } else {
      const isRenterRole = defaultRole === "rental" || defaultRole === "renter";
      setFormData({
        name: "",
        email: "",
        password: "",
        role: defaultRole,
        phone: "",
        agencyName: "",
        reraId: "",
        region: "",
        preferredCity: "Ahmedabad",
        budgetRange: isRenterRole ? "₹ 25,000/month" : "",
      });
    }
    setValidationError("");
  }, [user, defaultRole, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setValidationError("Full name is required.");
      return;
    }
    if (!formData.email.trim()) {
      setValidationError("Email address is required.");
      return;
    }
    if (!user && !formData.password) {
      setValidationError("Password is required for creating a new user account.");
      return;
    }
    setValidationError("");
    onSave(formData);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl border border-slate-200 relative my-8 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-heading font-bold text-base sm:text-lg text-[#172B3A]">
              {user ? `Edit User: ${user.name}` : "Create New User Account"}
            </h3>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              {user
                ? "Update user profile details and role permissions."
                : "Add a verified buyer, tenant, seller, agent, or administrator."}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Validation Alert */}
        {validationError && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {validationError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs font-sans">
          {/* Full Name */}
          <div>
            <label className="block text-slate-700 font-medium mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#315C4B] transition-colors"
              />
            </div>
          </div>

          {/* Email & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#315C4B] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Password {user ? "(Leave blank to keep)" : <span className="text-rose-500">*</span>}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required={!user}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#315C4B] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Role & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Assigned Role <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 capitalize bg-white focus:outline-none focus:border-[#315C4B] transition-colors font-medium"
              >
                <option value="buyer">Buyer (Client)</option>
                <option value="rental">Rental (Tenant)</option>
                <option value="seller">Seller (Property Owner)</option>
                <option value="agent">Agent (Broker)</option>
                <option value="admin">Admin (System Administrator)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 00000"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#315C4B] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Agent Specific Fields */}
          {formData.role === "agent" && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <span className="text-[11px] font-semibold text-slate-700 tracking-wider uppercase block">
                Agent & Broker Credentials
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Agency Name</label>
                  <div className="relative">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.agencyName}
                      onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                      placeholder="e.g. Prestige Realty"
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-[#315C4B] transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">RERA Number</label>
                  <div className="relative">
                    <FileBadge className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.reraId}
                      onChange={(e) => setFormData({ ...formData, reraId: e.target.value })}
                      placeholder="e.g. PR/GJ/AHM/10293"
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-[#315C4B] transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* City & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Preferred City</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.preferredCity}
                  onChange={(e) => setFormData({ ...formData, preferredCity: e.target.value })}
                  placeholder="e.g. Ahmedabad"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#315C4B] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                {formData.role === "renter" || formData.role === "rental"
                  ? "Monthly Rental Budget"
                  : "Purchase Budget / Range"}
              </label>
              <input
                type="text"
                value={formData.budgetRange}
                onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                placeholder={
                  formData.role === "renter" || formData.role === "rental"
                    ? "e.g. ₹ 25,000/month"
                    : "e.g. ₹ 1 Cr - ₹ 2 Cr"
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#315C4B] transition-colors"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#315C4B] hover:bg-[#254538] shadow-xs flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{user ? "Save Changes" : "Create User"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
