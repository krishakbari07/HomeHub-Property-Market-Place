import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Building, IndianRupee, ChevronDown } from "lucide-react";

const SearchBar = () => {
  const navigate = useNavigate();

  const [purpose, setPurpose] = useState("buy");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const handlePurposeChange = (newPurpose) => {
    setPurpose(newPurpose);
    setMinPrice("");
    setMaxPrice("");
  };

  const handleSearch = (e) => {
    e.preventDefault();

    if (purpose === "sell") {
      navigate("/sell");
      return;
    }

    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (propertyType) params.set("type", propertyType);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);

    const targetRoute = purpose === "rent" ? "/rent" : "/buy";
    navigate(`${targetRoute}?${params.toString()}`);
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-elevated border border-ivory-300 max-w-4xl text-left space-y-4">
      {/* Purpose Tabs */}
      <div className="inline-flex p-1 bg-ivory-200 rounded-xl space-x-1 border border-ivory-300">
        <button
          type="button"
          onClick={() => handlePurposeChange("buy")}
          className={`px-5 py-2 rounded-lg font-bold text-xs transition-all ${
            purpose === "buy"
              ? "bg-navy-800 text-white shadow-subtle"
              : "text-navy-700 hover:text-navy-950"
          }`}
        >
          Buy Properties
        </button>
        <button
          type="button"
          onClick={() => handlePurposeChange("rent")}
          className={`px-5 py-2 rounded-lg font-bold text-xs transition-all ${
            purpose === "rent"
              ? "bg-navy-800 text-white shadow-subtle"
              : "text-navy-700 hover:text-navy-950"
          }`}
        >
          Rent
        </button>
        <button
          type="button"
          onClick={() => handlePurposeChange("sell")}
          className={`px-5 py-2 rounded-lg font-bold text-xs transition-all ${
            purpose === "sell"
              ? "bg-navy-800 text-white shadow-subtle"
              : "text-navy-700 hover:text-navy-950"
          }`}
        >
          Sell / List
        </button>
      </div>

      {/* Inputs Form */}
      <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
        {/* Location */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-navy-600 block uppercase tracking-wider">
            City or Locality
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-navy-400 absolute left-3 top-3" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Bodakdev, Bopal"
              className="w-full bg-ivory-50 border border-ivory-300 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-navy-900 focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600"
            />
          </div>
        </div>

        {/* Property Type */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-navy-600 block uppercase tracking-wider">
            Property Type
          </label>
          <div className="relative">
            <Building className="w-4 h-4 text-navy-400 absolute left-3 top-3" />
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full bg-ivory-50 border border-ivory-300 rounded-xl pl-9 pr-8 py-2.5 text-xs font-semibold text-navy-900 appearance-none focus:outline-none focus:border-forest-600 cursor-pointer"
            >
              <option value="">All Categories</option>
              <option value="Villa">Luxury Villa</option>
              <option value="Apartment">Apartment</option>
              <option value="Flat">Flat / Penthouse</option>
              <option value="Penthouse">Sky Penthouse</option>
            </select>
            <ChevronDown className="w-4 h-4 text-navy-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Min Price / Rent */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-navy-600 block uppercase tracking-wider">
            {purpose === "rent" ? "Min Monthly Rent" : "Min Budget"}
          </label>
          <div className="relative">
            <IndianRupee className="w-4 h-4 text-navy-400 absolute left-3 top-3" />
            <select
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full bg-ivory-50 border border-ivory-300 rounded-xl pl-9 pr-8 py-2.5 text-xs font-semibold text-navy-900 appearance-none focus:outline-none focus:border-forest-600 cursor-pointer"
            >
              <option value="">No Minimum</option>
              {purpose === "rent" ? (
                <>
                  <option value="10000">₹10,000 / mo</option>
                  <option value="25000">₹25,000 / mo</option>
                  <option value="50000">₹50,000 / mo</option>
                  <option value="75000">₹75,000 / mo</option>
                </>
              ) : (
                <>
                  <option value="2500000">₹25 Lakh</option>
                  <option value="5000000">₹50 Lakh</option>
                  <option value="10000000">₹1 Crore</option>
                  <option value="20000000">₹2 Crore</option>
                </>
              )}
            </select>
            <ChevronDown className="w-4 h-4 text-navy-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Max Price / Rent */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-navy-600 block uppercase tracking-wider">
            {purpose === "rent" ? "Max Monthly Rent" : "Max Budget"}
          </label>
          <div className="relative">
            <IndianRupee className="w-4 h-4 text-navy-400 absolute left-3 top-3" />
            <select
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-ivory-50 border border-ivory-300 rounded-xl pl-9 pr-8 py-2.5 text-xs font-semibold text-navy-900 appearance-none focus:outline-none focus:border-forest-600 cursor-pointer"
            >
              <option value="">No Maximum</option>
              {purpose === "rent" ? (
                <>
                  <option value="35000">₹35,000 / mo</option>
                  <option value="50000">₹50,000 / mo</option>
                  <option value="100000">₹1,00,000 / mo</option>
                  <option value="200000">₹2,00,000 / mo</option>
                </>
              ) : (
                <>
                  <option value="10000000">₹1 Crore</option>
                  <option value="25000000">₹2.5 Crore</option>
                  <option value="50000000">₹5 Crore</option>
                  <option value="100000000">₹10 Crore</option>
                </>
              )}
            </select>
            <ChevronDown className="w-4 h-4 text-navy-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Search CTA */}
        <div>
          <button
            type="submit"
            className="w-full bg-forest-700 hover:bg-forest-800 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 text-xs transition-all shadow-subtle border border-forest-800 active:scale-98"
          >
            <Search className="w-4 h-4" />
            <span>Search Portfolio</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
