import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Plus,
  Search,
  X,
  Edit,
  Trash2,
  ExternalLink,
  MapPin,
  Filter,
} from "lucide-react";

export default function AdminProperties({
  properties = [],
  onOpenPropertyModal,
  onDeleteProperty,
}) {
  const [purposeFilter, setPurposeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const buyProperties = properties.filter((p) =>
    ["buy", "sale", "for sale"].includes((p.purpose || p.listingType || "buy").toLowerCase())
  );
  const rentProperties = properties.filter((p) =>
    ["rent", "rental", "for rent"].includes((p.purpose || p.listingType || "").toLowerCase())
  );

  const filteredProperties = properties.filter((prop) => {
    // Purpose filter
    const isRent = ["rent", "rental", "for rent"].includes(
      (prop.purpose || prop.listingType || "").toLowerCase()
    );
    if (purposeFilter === "buy" && isRent) return false;
    if (purposeFilter === "rent" && !isRent) return false;

    // Status filter
    if (statusFilter !== "all") {
      const pStatus = (prop.status || "available").toLowerCase();
      if (pStatus !== statusFilter.toLowerCase()) return false;
    }

    // Search query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (prop.title && prop.title.toLowerCase().includes(q)) ||
      (prop.location && prop.location.toLowerCase().includes(q)) ||
      (prop.city && prop.city.toLowerCase().includes(q)) ||
      (prop.type && prop.type.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-5">
      {/* Top Filter Tabs & Add Property Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Purpose Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-lg">
          <button
            onClick={() => setPurposeFilter("all")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              purposeFilter === "all"
                ? "bg-[#172B3A] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <span>All Listings</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                purposeFilter === "all" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              {properties.length}
            </span>
          </button>

          <button
            onClick={() => setPurposeFilter("buy")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              purposeFilter === "buy"
                ? "bg-[#172B3A] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <span>For Sale</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                purposeFilter === "buy" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              {buyProperties.length}
            </span>
          </button>

          <button
            onClick={() => setPurposeFilter("rent")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              purposeFilter === "rent"
                ? "bg-[#172B3A] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <span>For Rent</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                purposeFilter === "rent" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              {rentProperties.length}
            </span>
          </button>
        </div>

        {/* Add Property Button */}
        <button
          onClick={() => onOpenPropertyModal(null, purposeFilter === "rent" ? "rent" : "buy")}
          className="px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-[#315C4B] hover:bg-[#254538] transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Property</span>
        </button>
      </div>

      {/* Search & Status Secondary Filter Bar */}
      <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-1">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by property title, locality, city, or property type..."
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

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-3">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] font-medium text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold px-2.5 py-1 rounded-md border border-slate-200 bg-[#F7F5F0] text-slate-800 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Sold">Sold</option>
            <option value="Rented">Rented</option>
          </select>
        </div>
      </div>

      {/* Properties Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F5F0] border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Property</th>
                <th className="py-3 px-4">Purpose</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredProperties.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 px-4 text-center text-slate-400">
                    <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">No properties match your filter</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {searchQuery || statusFilter !== "all"
                        ? "Try resetting filters or search query."
                        : "Click '+ Add New Property' to create your first listing."}
                    </p>
                    {(searchQuery || statusFilter !== "all" || purposeFilter !== "all") && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setStatusFilter("all");
                          setPurposeFilter("all");
                        }}
                        className="mt-3 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors"
                      >
                        Reset All Filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredProperties.map((prop) => {
                  const pid = prop._id || prop.id;
                  const isRent = ["rent", "rental", "for rent"].includes(
                    (prop.purpose || prop.listingType || "").toLowerCase()
                  );

                  return (
                    <tr key={pid} className="hover:bg-slate-50/60 transition-colors">
                      {/* Property Image & Title */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              prop.image ||
                              "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=200&q=80"
                            }
                            alt={prop.title}
                            className="w-12 h-9 object-cover rounded-md border border-slate-200 shrink-0 bg-slate-100"
                            loading="lazy"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate max-w-xs sm:max-w-sm">
                              {prop.title}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              {prop.type || "Apartment"}
                              {prop.bedrooms ? ` • ${prop.bedrooms} BHK` : ""}
                              {prop.areaSqFt ? ` • ${prop.areaSqFt} sq ft` : ""}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Purpose Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                            isRent
                              ? "bg-slate-100 text-slate-700 border border-slate-200"
                              : "bg-[#315C4B]/10 text-[#315C4B] border border-[#315C4B]/20"
                          }`}
                        >
                          {isRent ? "For Rent" : "For Sale"}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 font-heading font-bold text-slate-900 whitespace-nowrap">
                        {prop.formattedPrice ||
                          (isRent
                            ? `₹ ${Number(prop.price).toLocaleString("en-IN")}/mo`
                            : `₹ ${Number(prop.price).toLocaleString("en-IN")}`)}
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4 text-slate-600">
                        <div className="flex items-center gap-1 truncate max-w-[180px]">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {prop.location}, {prop.city || "Ahmedabad"}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${
                            prop.status === "Sold" || prop.status === "Rented"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {prop.status || "Available"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Link
                            to={`/property/${pid}`}
                            target="_blank"
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
                            title="View property on public website"
                            aria-label={`View ${prop.title}`}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => onOpenPropertyModal(prop)}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                            title="Edit listing details"
                            aria-label={`Edit ${prop.title}`}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteProperty(pid, prop.title)}
                            className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Delete property"
                            aria-label={`Delete ${prop.title}`}
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

        {/* Table Footer */}
        <div className="px-4 py-3 bg-[#F7F5F0] border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>
            Showing <strong className="text-slate-800">{filteredProperties.length}</strong> of{" "}
            <strong className="text-slate-800">{properties.length}</strong> listings
          </span>
          {(purposeFilter !== "all" || statusFilter !== "all") && (
            <button
              onClick={() => {
                setPurposeFilter("all");
                setStatusFilter("all");
              }}
              className="text-[#315C4B] hover:underline font-medium text-[11px]"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
