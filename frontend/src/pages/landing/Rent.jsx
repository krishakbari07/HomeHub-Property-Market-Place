import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  SlidersHorizontal,
  RotateCcw,
  Search,
  X,
  AlertCircle,
  RefreshCw,
  Loader2,
  Building2,
  MapPin,
  Sofa,
  Sparkles,
  Bot,
} from "lucide-react";
import { propertyApi, aiApi } from "../../services/api";
import PropertyCard from "../../components/common/PropertyCard";
import EmptyState from "../../components/common/EmptyState";
import ImageWithFallback from "../../components/common/ImageWithFallback";

const Rent = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter State initialized from URL query params
  const [keyword, setKeyword] = useState(
    searchParams.get("search") || searchParams.get("keyword") || searchParams.get("q") || ""
  );
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [propertyType, setPropertyType] = useState(searchParams.get("type") || "");
  const [minRent, setMinRent] = useState(searchParams.get("minPrice") || searchParams.get("minRent") || "");
  const [maxRent, setMaxRent] = useState(searchParams.get("maxPrice") || searchParams.get("maxRent") || "");
  const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") || "");
  const [furnishing, setFurnishing] = useState(searchParams.get("furnishing") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "default");

  // API State
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // AI Smart Search State
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiActiveParsed, setAiActiveParsed] = useState(null);

  const handleAiSmartSearch = async (queryText) => {
    const q = (queryText || aiQuery).trim();
    if (!q) return;
    setAiLoading(true);
    setError(null);

    try {
      const res = await aiApi.smartSearch(q);
      if (res && res.success) {
        if (res.parsedFilters?.purpose === "buy") {
          const params = new URLSearchParams();
          if (res.parsedFilters.location) params.set("location", res.parsedFilters.location);
          if (res.parsedFilters.type) params.set("type", res.parsedFilters.type);
          if (res.parsedFilters.maxPrice) params.set("maxPrice", res.parsedFilters.maxPrice.toString());
          navigate(`/buy?${params.toString()}`);
          return;
        }

        // Enforce strict rent check
        const results = (Array.isArray(res.properties) ? res.properties : []).filter((p) => {
          const pPurp = (p.purpose || p.listingType || "").toLowerCase();
          return pPurp === "rent" || pPurp === "rental" || pPurp === "for rent";
        });
        setProperties(results);
        setAiActiveParsed(res.parsedFilters || {});

        // Sync visible inputs if filters extracted
        if (res.parsedFilters?.location) setLocation(res.parsedFilters.location);
        if (res.parsedFilters?.type) setPropertyType(res.parsedFilters.type);
        if (res.parsedFilters?.minPrice) setMinRent(res.parsedFilters.minPrice.toString());
        if (res.parsedFilters?.maxPrice) setMaxRent(res.parsedFilters.maxPrice.toString());
        if (res.parsedFilters?.bedrooms) setBedrooms(res.parsedFilters.bedrooms.toString());
      } else {
        fetchRentProperties();
      }
    } catch (err) {
      console.error("AI Rent Search Error:", err);
      fetchRentProperties();
    } finally {
      setAiLoading(false);
    }
  };

  const handleClearAiSearch = () => {
    setAiQuery("");
    setAiActiveParsed(null);
    fetchRentProperties();
  };

  // Fetch properties matching current filters from the backend
  const fetchRentProperties = useCallback(async (overrides = {}) => {
    setLoading(true);
    setError(null);
    try {
      const activeKeyword = overrides.keyword !== undefined ? overrides.keyword : keyword;
      const activeLocation = overrides.location !== undefined ? overrides.location : location;
      const activeType = overrides.propertyType !== undefined ? overrides.propertyType : propertyType;
      const activeMinRent = overrides.minRent !== undefined ? overrides.minRent : minRent;
      const activeMaxRent = overrides.maxRent !== undefined ? overrides.maxRent : maxRent;
      const activeBedrooms = overrides.bedrooms !== undefined ? overrides.bedrooms : bedrooms;
      const activeFurnishing = overrides.furnishing !== undefined ? overrides.furnishing : furnishing;
      const activeSortBy = overrides.sortBy !== undefined ? overrides.sortBy : sortBy;

      const params = {
        purpose: "rent",
      };

      if (activeKeyword.trim()) params.search = activeKeyword.trim();
      if (activeLocation && activeLocation !== "all") params.location = activeLocation;
      if (activeType && activeType !== "all") params.type = activeType;
      if (activeMinRent) params.minPrice = activeMinRent;
      if (activeMaxRent) params.maxPrice = activeMaxRent;
      if (activeBedrooms && activeBedrooms !== "all") params.bedrooms = activeBedrooms;
      if (activeFurnishing && activeFurnishing !== "all") params.furnishing = activeFurnishing;
      if (activeSortBy && activeSortBy !== "default") params.sortBy = activeSortBy;

      const res = await propertyApi.getAll(params);
      const list = Array.isArray(res) ? res : res?.data || res?.properties || [];

      // Guarantee strict Rent purpose filtering on client as defense in depth
      const strictRentList = list.filter((p) => {
        const pPurp = (p.purpose || p.listingType || "").toLowerCase();
        return pPurp === "rent" || pPurp === "rental" || pPurp === "for rent";
      });

      setProperties(strictRentList);
    } catch (err) {
      console.error("Rent properties fetch failed:", err);
      const msg = err.response?.data?.message || err.message || "Failed to load rental properties.";
      setError(msg);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [keyword, location, propertyType, minRent, maxRent, bedrooms, furnishing, sortBy]);

  // Initial fetch on mount & URL param sync
  useEffect(() => {
    const urlKeyword = searchParams.get("search") || searchParams.get("keyword") || searchParams.get("q") || "";
    const urlLoc = searchParams.get("location") || "";
    const urlType = searchParams.get("type") || "";
    const urlMinP = searchParams.get("minPrice") || searchParams.get("minRent") || "";
    const urlMaxP = searchParams.get("maxPrice") || searchParams.get("maxRent") || "";
    const urlBeds = searchParams.get("bedrooms") || "";
    const urlFurn = searchParams.get("furnishing") || "";
    const urlSort = searchParams.get("sortBy") || "default";

    setKeyword(urlKeyword);
    setLocation(urlLoc);
    setPropertyType(urlType);
    setMinRent(urlMinP);
    setMaxRent(urlMaxP);
    setBedrooms(urlBeds);
    setFurnishing(urlFurn);
    setSortBy(urlSort);

    fetchRentProperties({
      keyword: urlKeyword,
      location: urlLoc,
      propertyType: urlType,
      minRent: urlMinP,
      maxRent: urlMaxP,
      bedrooms: urlBeds,
      furnishing: urlFurn,
      sortBy: urlSort,
    });
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle Apply Filters / Form Submit
  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();

    const newParams = new URLSearchParams();
    if (keyword.trim()) newParams.set("search", keyword.trim());
    if (location) newParams.set("location", location);
    if (propertyType) newParams.set("type", propertyType);
    if (minRent) newParams.set("minPrice", minRent);
    if (maxRent) newParams.set("maxPrice", maxRent);
    if (bedrooms) newParams.set("bedrooms", bedrooms);
    if (furnishing) newParams.set("furnishing", furnishing);
    if (sortBy && sortBy !== "default") newParams.set("sortBy", sortBy);

    setSearchParams(newParams);
    fetchRentProperties();
  };

  // Handle Reset Filters
  const handleResetFilters = () => {
    setKeyword("");
    setLocation("");
    setPropertyType("");
    setMinRent("");
    setMaxRent("");
    setBedrooms("");
    setFurnishing("");
    setSortBy("default");
    setAiQuery("");
    setAiActiveParsed(null);
    setSearchParams(new URLSearchParams());
    fetchRentProperties({
      keyword: "",
      location: "",
      propertyType: "",
      minRent: "",
      maxRent: "",
      bedrooms: "",
      furnishing: "",
      sortBy: "default",
    });
  };

  // Client-side instant sorting if results already fetched
  const sortedProperties = useMemo(() => {
    const list = [...properties];
    if (sortBy === "price-low") {
      return list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    }
    if (sortBy === "price-high") {
      return list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    }
    return list;
  }, [properties, sortBy]);

  return (
    <div className="py-10 bg-[#F7F5F0] min-h-screen text-[#24313A] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Architectural Hero Banner */}
        <div className="relative rounded-2xl overflow-hidden shadow-sm bg-[#172B3A] text-white p-8 sm:p-12 border border-[#243E53]">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2400&q=95"
            fallbackSrc="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2400&q=95"
            alt="Verified Rental Residences"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#172B3A] via-[#172B3A]/90 to-transparent" />

          {/* Hero Content */}
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-[#243E53]/80 border border-[#D5AD72]/40 rounded-full text-xs font-semibold uppercase tracking-wider text-[#D5AD72]">
                Prime Rental Residences
              </span>
              <h1 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight text-white">
                Properties for Rent
              </h1>
              <p className="text-[#D5DDE2] text-sm max-w-xl leading-relaxed">
                Explore fully furnished high-rise apartments, gated villas, and corporate executive suites across Gujarat with verified lease terms.
              </p>
            </div>

            <div className="bg-[#172B3A]/95 border border-[#243E53] px-6 py-3.5 rounded-xl text-center shrink-0 shadow-sm">
              <span className="text-2xl sm:text-3xl font-heading font-extrabold text-[#D5AD72] block">
                {loading ? "..." : sortedProperties.length}
              </span>
              <span className="text-xs text-[#D5DDE2] uppercase font-semibold tracking-wider">
                Available Rentals
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls Surface */}
        <div className="bg-white rounded-xl p-5 sm:p-6 shadow-xs border border-[#DCE2E5] space-y-4">
          {/* Header Row */}
          <div className="flex items-center justify-between border-b border-[#DCE2E5] pb-3">
            <div className="flex items-center gap-2 font-heading font-bold text-sm text-[#172B3A]">
              <SlidersHorizontal className="w-4 h-4 text-[#315C4B]" />
              <span>Filter & Search Rental Properties</span>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-semibold text-[#315C4B] hover:text-[#254538] flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>

          {/* AI Natural Language Search Box */}
          <div className="bg-[#172B3A] rounded-xl p-3.5 sm:p-4 text-white border border-[#243E53] shadow-inner space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#D5AD72]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#D5AD72]">
                  Gemini AI Natural-Language Rental Search
                </span>
              </div>
              <span className="text-[10px] text-gray-400 font-sans hidden sm:inline">
                Type what you need in plain words
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Bot className="w-4 h-4 text-[#D5AD72] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAiSmartSearch();
                    }
                  }}
                  placeholder="e.g. 'Furnished 2 BHK apartment in Satellite under 45000' or '3 BHK villa for rent'..."
                  className="w-full bg-[#101F2B] border border-[#243E53] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#D5AD72] font-sans"
                />
              </div>

              <button
                type="button"
                onClick={() => handleAiSmartSearch()}
                disabled={aiLoading || !aiQuery.trim()}
                className="bg-[#315C4B] hover:bg-[#254639] disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 shadow-sm"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#D5AD72]" />
                    <span>AI Search</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Prompt Suggestions & Active Parsed Badge */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-gray-300">
                <span className="text-gray-400">Try:</span>
                {[
                  "2 BHK in Satellite under 50k",
                  "Furnished apartment in Bodakdev",
                  "3 BHK villa for rent",
                ].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => {
                      setAiQuery(sample);
                      handleAiSmartSearch(sample);
                    }}
                    className="px-2 py-0.5 rounded bg-[#243E53]/80 hover:bg-[#243E53] text-[#D5AD72] text-[10px] font-medium border border-[#D5AD72]/30 transition-colors"
                  >
                    {sample}
                  </button>
                ))}
              </div>

              {aiActiveParsed && (
                <div className="flex items-center space-x-2 text-[11px] text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800">
                  <span>
                    ✓ AI Parsed: {aiActiveParsed.type || "Rental"} {aiActiveParsed.location ? `in ${aiActiveParsed.location}` : ""} {aiActiveParsed.bedrooms ? `• ${aiActiveParsed.bedrooms}+ BHK` : ""}
                  </span>
                  <button
                    type="button"
                    onClick={handleClearAiSearch}
                    className="text-gray-400 hover:text-white"
                    title="Clear AI search filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search Input Form */}
          <form onSubmit={handleApplyFilters} className="space-y-4">
            {/* Primary Keyword Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#596873] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search by rental title, locality, address, or landmark (Press Enter to search)..."
                className="w-full bg-[#F7F5F0] border border-[#DCE2E5] rounded-lg pl-10 pr-9 py-2.5 text-xs text-[#24313A] placeholder-[#596873] focus:outline-none focus:border-[#315C4B] focus:bg-white transition-colors"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => {
                    setKeyword("");
                    fetchRentProperties({ keyword: "" });
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#596873] hover:text-[#24313A] p-0.5"
                  aria-label="Clear search input"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
              {/* City / Location */}
              <div>
                <label className="text-[11px] font-semibold text-[#596873] block mb-1 uppercase tracking-wider">
                  Location / City
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-[#596873] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#F7F5F0] border border-[#DCE2E5] rounded-lg pl-8 pr-2.5 py-2 text-xs font-medium text-[#24313A] focus:outline-none focus:border-[#315C4B] focus:bg-white transition-colors"
                  >
                    <option value="">All Locations</option>
                    <option value="Ahmedabad">Ahmedabad</option>
                    <option value="Satellite">Satellite</option>
                    <option value="Bodakdev">Bodakdev</option>
                    <option value="Bopal">Bopal</option>
                    <option value="Shela">Shela</option>
                    <option value="Surat">Surat</option>
                    <option value="Vadodara">Vadodara</option>
                    <option value="Gandhinagar">Gandhinagar</option>
                  </select>
                </div>
              </div>

              {/* Property Type */}
              <div>
                <label className="text-[11px] font-semibold text-[#596873] block mb-1 uppercase tracking-wider">
                  Property Type
                </label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 text-[#596873] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full bg-[#F7F5F0] border border-[#DCE2E5] rounded-lg pl-8 pr-2.5 py-2 text-xs font-medium text-[#24313A] focus:outline-none focus:border-[#315C4B] focus:bg-white transition-colors"
                  >
                    <option value="">All Types</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">Villa</option>
                    <option value="Flat">Flat</option>
                    <option value="Penthouse">Penthouse</option>
                    <option value="House">Independent House</option>
                    <option value="Commercial">Commercial Office</option>
                  </select>
                </div>
              </div>

              {/* Min Rent */}
              <div>
                <label className="text-[11px] font-semibold text-[#596873] block mb-1 uppercase tracking-wider">
                  Min Rent / Mo
                </label>
                <select
                  value={minRent}
                  onChange={(e) => setMinRent(e.target.value)}
                  className="w-full bg-[#F7F5F0] border border-[#DCE2E5] rounded-lg px-2.5 py-2 text-xs font-medium text-[#24313A] focus:outline-none focus:border-[#315C4B] focus:bg-white transition-colors"
                >
                  <option value="">Any Min</option>
                  <option value="15000">₹15,000 /mo</option>
                  <option value="25000">₹25,000 /mo</option>
                  <option value="40000">₹40,000 /mo</option>
                  <option value="60000">₹60,000 /mo</option>
                  <option value="100000">₹1,00,000 /mo</option>
                </select>
              </div>

              {/* Max Rent */}
              <div>
                <label className="text-[11px] font-semibold text-[#596873] block mb-1 uppercase tracking-wider">
                  Max Rent / Mo
                </label>
                <select
                  value={maxRent}
                  onChange={(e) => setMaxRent(e.target.value)}
                  className="w-full bg-[#F7F5F0] border border-[#DCE2E5] rounded-lg px-2.5 py-2 text-xs font-medium text-[#24313A] focus:outline-none focus:border-[#315C4B] focus:bg-white transition-colors"
                >
                  <option value="">Any Max</option>
                  <option value="25000">Up to ₹25,000 /mo</option>
                  <option value="40000">Up to ₹40,000 /mo</option>
                  <option value="60000">Up to ₹60,000 /mo</option>
                  <option value="100000">Up to ₹1,00,000 /mo</option>
                  <option value="250000">Up to ₹2,50,000 /mo</option>
                </select>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="text-[11px] font-semibold text-[#596873] block mb-1 uppercase tracking-wider">
                  Bedrooms
                </label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full bg-[#F7F5F0] border border-[#DCE2E5] rounded-lg px-2.5 py-2 text-xs font-medium text-[#24313A] focus:outline-none focus:border-[#315C4B] focus:bg-white transition-colors"
                >
                  <option value="">Any Configuration</option>
                  <option value="1">1+ BHK</option>
                  <option value="2">2+ BHK</option>
                  <option value="3">3+ BHK</option>
                  <option value="4">4+ BHK</option>
                </select>
              </div>

              {/* Furnishing */}
              <div>
                <label className="text-[11px] font-semibold text-[#596873] block mb-1 uppercase tracking-wider">
                  Furnishing
                </label>
                <div className="relative">
                  <Sofa className="w-3.5 h-3.5 text-[#596873] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={furnishing}
                    onChange={(e) => setFurnishing(e.target.value)}
                    className="w-full bg-[#F7F5F0] border border-[#DCE2E5] rounded-lg pl-8 pr-2.5 py-2 text-xs font-medium text-[#24313A] focus:outline-none focus:border-[#315C4B] focus:bg-white transition-colors"
                  >
                    <option value="">All Furnishing</option>
                    <option value="Fully Furnished">Fully Furnished</option>
                    <option value="Semi-Furnished">Semi-Furnished</option>
                    <option value="Unfurnished">Unfurnished</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-[#DCE2E5]">
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#596873]">
                  {loading
                    ? "Searching rentals..."
                    : `Showing ${sortedProperties.length} verified rental residence${
                        sortedProperties.length === 1 ? "" : "s"
                      }`}
                </span>

                <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#596873]">
                  <span className="text-[11px] font-medium text-[#596873]">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-[#F7F5F0] border border-[#DCE2E5] rounded px-2 py-1 text-xs text-[#24313A] focus:outline-none"
                  >
                    <option value="default">Default Match</option>
                    <option value="price-low">Rent: Low to High</option>
                    <option value="price-high">Rent: High to Low</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-[#315C4B] hover:bg-[#254538] transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Apply Filters</span>
              </button>
            </div>
          </form>
        </div>

        {/* Error State with Retry Button */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchRentProperties()}
              className="px-3 py-1.5 rounded-lg bg-white border border-rose-200 text-rose-700 hover:bg-rose-100 font-semibold text-xs flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Search</span>
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-white rounded-xl border border-[#DCE2E5] p-4 space-y-3">
                <div className="h-44 bg-slate-100 rounded-lg" />
                <div className="h-4 bg-slate-100 rounded w-1/3" />
                <div className="h-5 bg-slate-100 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Results Grid */}
        {!loading && sortedProperties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProperties.map((property) => (
              <PropertyCard key={property._id || property.id} property={property} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && sortedProperties.length === 0 && (
          <EmptyState
            title="No Rental Residences Matched Your Criteria"
            description="We couldn't find any rental properties matching your current search parameters. Try broadening your location, adjusting monthly budget limits, or clearing the search keyword."
            onAction={handleResetFilters}
            actionText="Clear All Filters"
          />
        )}
      </div>
    </div>
  );
};

export default Rent;
