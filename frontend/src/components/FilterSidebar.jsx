import React from "react";
import { RotateCcw, SlidersHorizontal } from "lucide-react";

const FilterSidebar = ({ filters, setFilters, resetFilters }) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-ivory-300 shadow-subtle space-y-6">
      <div className="flex items-center justify-between border-b border-ivory-200 pb-4">
        <div className="flex items-center space-x-2 font-heading font-bold text-navy-900">
          <SlidersHorizontal className="w-5 h-5 text-forest-700" />
          <span>Filter Properties</span>
        </div>
        <button
          onClick={resetFilters}
          className="text-xs font-bold text-forest-700 hover:text-forest-800 flex items-center space-x-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Purpose */}
      <div>
        <label className="text-xs font-bold text-navy-700 block mb-2 uppercase tracking-wider">Purpose</label>
        <div className="grid grid-cols-3 gap-2">
          {["all", "buy", "rent"].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setFilters({ ...filters, purpose: p })}
              className={`py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                filters.purpose === p
                  ? "bg-navy-800 text-white border-navy-800 shadow-subtle"
                  : "bg-ivory-50 text-navy-700 border-ivory-300 hover:bg-ivory-200"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* City */}
      <div>
        <label className="text-xs font-bold text-navy-700 block mb-1 uppercase tracking-wider">City</label>
        <select
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          className="w-full border border-ivory-300 p-2.5 rounded-xl text-sm font-semibold text-navy-900 bg-ivory-50 outline-none focus:border-forest-600"
        >
          <option value="All">All Cities</option>
          <option value="Ahmedabad">Ahmedabad</option>
          <option value="Surat">Surat</option>
          <option value="Vadodara">Vadodara</option>
          <option value="Gandhinagar">Gandhinagar</option>
          <option value="Rajkot">Rajkot</option>
        </select>
      </div>

      {/* Property Type */}
      <div>
        <label className="text-xs font-bold text-navy-700 block mb-1 uppercase tracking-wider">Property Type</label>
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="w-full border border-ivory-300 p-2.5 rounded-xl text-sm font-semibold text-navy-900 bg-ivory-50 outline-none focus:border-forest-600"
        >
          <option value="All Types">All Types</option>
          <option value="Villa">Villa</option>
          <option value="Apartment">Apartment</option>
          <option value="Flat">Flat</option>
          <option value="Penthouse">Penthouse</option>
        </select>
      </div>

      {/* Bedrooms */}
      <div>
        <label className="text-xs font-bold text-navy-700 block mb-1 uppercase tracking-wider">Bedrooms</label>
        <select
          value={filters.bedrooms}
          onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
          className="w-full border border-ivory-300 p-2.5 rounded-xl text-sm font-semibold text-navy-900 bg-ivory-50 outline-none focus:border-forest-600"
        >
          <option value="Any">Any BHK</option>
          <option value="2">2 BHK</option>
          <option value="3">3 BHK</option>
          <option value="4+">4+ BHK</option>
        </select>
      </div>
    </div>
  );
};

export default FilterSidebar;
