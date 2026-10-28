import React from "react";
import PropertyCard from "../components/PropertyCard";
import SearchBar from "../components/SearchBar";
import { properties } from "../data/properties";
import { ShoppingBag } from "lucide-react";

const Buy = () => {
  const buyProperties = properties.filter((p) => p.purpose === "buy");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-indigo-200">
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Properties For Sale</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Buy Your Dream Home</h1>
        <p className="text-indigo-200 text-sm sm:text-base max-w-xl mx-auto">
          Explore top verified houses, villas, and apartments for sale across Gujarat.
        </p>

        <div className="pt-4 max-w-3xl mx-auto">
          <SearchBar activeMode="buy" />
        </div>
      </div>

      {/* Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-extrabold text-gray-900">Featured Properties For Sale</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {buyProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>

    </div>
  );
};

export default Buy;
