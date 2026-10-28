import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import FilterSidebar from "../components/FilterSidebar";
import PropertyCard from "../components/PropertyCard";
import { properties } from "../data/properties";
import { Search, SlidersHorizontal } from "lucide-react";

const Properties = () => {
  const [searchParams] = useSearchParams();
  const initialPurpose = searchParams.get("purpose") || "all";
  const initialLocation = searchParams.get("location") || "";
  const initialType = searchParams.get("type") || "All Types";

  const [filters, setFilters] = useState({
    purpose: initialPurpose,
    city: initialLocation || "All",
    type: initialType,
    bedrooms: "Any",
    maxPrice: 50000000
  });

  const [sortBy, setSortBy] = useState("default");
  const [searchTerm, setSearchTerm] = useState(initialLocation);

  const resetFilters = () => {
    setFilters({
      purpose: "all",
      city: "All",
      type: "All Types",
      bedrooms: "Any",
      maxPrice: 50000000
    });
    setSearchTerm("");
    setSortBy("default");
  };

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      // Search term filter
      if (
        searchTerm &&
        !p.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !p.location.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      // Purpose filter
      if (filters.purpose !== "all" && p.purpose !== filters.purpose) {
        return false;
      }
      // City filter
      if (filters.city !== "All" && p.city.toLowerCase() !== filters.city.toLowerCase()) {
        return false;
      }
      // Type filter
      if (filters.type !== "All Types" && p.type !== filters.type) {
        return false;
      }
      // Bedrooms filter
      if (filters.bedrooms !== "Any") {
        if (filters.bedrooms === "4+" && p.bedrooms < 4) return false;
        if (filters.bedrooms !== "4+" && p.bedrooms !== parseInt(filters.bedrooms)) return false;
      }
      // Price filter
      if (p.price > filters.maxPrice) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "ai-score") return (b.aiMatchScore || 0) - (a.aiMatchScore || 0);
      return 0;
    });
  }, [filters, searchTerm, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Explore Properties</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Showing {filteredProperties.length} available properties matching your criteria
          </p>
        </div>

        {/* Search Bar & Sort Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search keyword..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="default">Sort by: Default</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="ai-score">Highest AI Match</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Sidebar + Properties */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sidebar */}
        <div className="lg:col-span-3">
          <FilterSidebar filters={filters} setFilters={setFilters} resetFilters={resetFilters} />
        </div>

        {/* Listings Grid */}
        <div className="lg:col-span-9">
          {filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 space-y-4">
              <SlidersHorizontal className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="text-lg font-bold text-gray-800">No properties found</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Try adjusting your filters or resetting your search parameters to discover more properties.
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Properties;
