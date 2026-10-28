import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  Bot,
  Calculator,
  TrendingUp,
  Info,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { aiApi } from "../../services/api";
import PropertyCard from "../../components/common/PropertyCard";
import ImageWithFallback from "../../components/common/ImageWithFallback";

const AIRecommendations = () => {
  const [activeTab, setActiveTab] = useState("matchmaker"); // "matchmaker" or "valuation"

  // TAB 1: MATCHMAKER STATE
  const [purpose, setPurpose] = useState("buy");
  const [location, setLocation] = useState("Ahmedabad");
  const [type, setType] = useState("Villa");
  const [bedrooms, setBedrooms] = useState("3");
  const [maxBudget, setMaxBudget] = useState("25000000");
  const [preferences, setPreferences] = useState(["Smart Home", "Private Garden"]);
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [isCalculated, setIsCalculated] = useState(false);
  const [recommendedResults, setRecommendedResults] = useState([]);

  // TAB 2: VALUATION ESTIMATOR STATE
  const [valCity, setValCity] = useState("Ahmedabad");
  const [valLocality, setValLocality] = useState("Bodakdev");
  const [valType, setValType] = useState("Villa");
  const [valArea, setValArea] = useState("2800");
  const [valBedrooms, setValBedrooms] = useState("4");
  const [valBathrooms, setValBathrooms] = useState("4");
  const [valPurpose, setValPurpose] = useState("buy");
  const [valLoading, setValLoading] = useState(false);
  const [valuationResult, setValuationResult] = useState(null);
  const [valError, setValError] = useState("");

  const togglePreference = (pref) => {
    setPreferences((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  // Handle Matchmaker Submit
  const handleFindProperties = async (e) => {
    e.preventDefault();
    setLoadingMatch(true);
    setIsCalculated(false);

    try {
      const res = await aiApi.getRecommendations({
        purpose,
        location,
        type,
        bedrooms,
        maxBudget,
        preferences,
      });

      const list = Array.isArray(res.recommendations) ? res.recommendations : [];
      setRecommendedResults(list);
      setIsCalculated(true);
    } catch (err) {
      console.error("Matchmaker fetch error:", err);
      setIsCalculated(true);
    } finally {
      setLoadingMatch(false);
    }
  };

  // Handle Valuation Submit
  const handleCalculateValuation = async (e) => {
    e.preventDefault();
    setValLoading(true);
    setValError("");
    setValuationResult(null);

    try {
      const res = await aiApi.getValuation({
        city: valCity,
        location: valLocality,
        propertyType: valType,
        areaSqFt: Number(valArea) || 1600,
        bedrooms: Number(valBedrooms) || 3,
        bathrooms: Number(valBathrooms) || 2,
        purpose: valPurpose,
      });

      if (res && res.success) {
        setValuationResult(res);
      } else {
        setValError(res?.message || "Valuation model returned unexpected output. Please check inputs.");
      }
    } catch (err) {
      console.error("Valuation calculation error:", err);
      setValError("Failed to calculate valuation estimate. Please try again.");
    } finally {
      setValLoading(false);
    }
  };

  const formatPrice = (val) => {
    const num = Number(val);
    if (!num) return "₹ 0";
    if (num >= 10000000) return `₹ ${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹ ${(num / 100000).toFixed(2)} Lakh`;
    return `₹ ${num.toLocaleString("en-IN")}`;
  };

  return (
    <div className="py-10 bg-[#F7F5F0] min-h-screen text-[#24313A] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Architectural Hero Header */}
        <div className="relative rounded-3xl overflow-hidden shadow-subtle bg-[#172B3A] text-white p-8 sm:p-14 text-center space-y-4 group border border-[#243E53]">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2400&q=95"
            fallbackSrc="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=95"
            alt="AI Real Estate Intelligence"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-30 scale-100 group-hover:scale-102 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#172B3A] via-[#172B3A]/90 to-transparent" />

          {/* Hero Content */}
          <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-[#101F2B]/80 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-[#D5AD72] border border-[#D5AD72]/30 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#D5AD72]" />
              <span>Gemini AI Property Intelligence</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-heading font-extrabold tracking-tight text-white">
              Intelligent Real Estate Insights
            </h1>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed font-sans font-medium">
              Powered by Google Gemini 2.5 and calibrated against genuine HomeHub market listings for grounded, reliable guidance.
            </p>

            {/* Navigation Switcher Tabs */}
            <div className="inline-flex p-1 rounded-2xl bg-[#101F2B]/90 border border-[#243E53] shadow-md mt-4">
              <button
                type="button"
                onClick={() => setActiveTab("matchmaker")}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                  activeTab === "matchmaker"
                    ? "bg-[#315C4B] text-white shadow-xs border border-forest-600"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                <Bot className="w-4 h-4 text-[#D5AD72]" />
                <span>Residence Matchmaker</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("valuation")}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                  activeTab === "valuation"
                    ? "bg-[#315C4B] text-white shadow-xs border border-forest-600"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                <Calculator className="w-4 h-4 text-[#D5AD72]" />
                <span>Fair Price Estimator</span>
              </button>
            </div>
          </div>
        </div>

        {/* TAB 1: RESIDENCE MATCHMAKER */}
        {activeTab === "matchmaker" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Wizard Form */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xs border border-[#DCE2E5] max-w-4xl mx-auto space-y-6">
              <div className="flex items-center space-x-3 border-b border-[#DCE2E5] pb-4">
                <Bot className="w-6 h-6 text-[#315C4B]" />
                <div>
                  <h2 className="text-lg sm:text-xl font-heading font-bold text-[#172B3A]">
                    Lifestyle & Residence Criteria
                  </h2>
                  <p className="text-xs text-[#596873]">
                    Configure your spatial preferences to compute probabilistic property alignment
                  </p>
                </div>
              </div>

              <form onSubmit={handleFindProperties} className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-[#172B3A] uppercase tracking-wider block mb-2">
                    1. Purpose of Acquisition
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPurpose("buy")}
                      className={`py-3.5 rounded-xl font-bold text-xs border transition-all ${
                        purpose === "buy"
                          ? "bg-[#172B3A] text-white border-[#172B3A] shadow-xs"
                          : "bg-[#F7F5F0] text-[#24313A] border-[#DCE2E5] hover:bg-gray-100"
                      }`}
                    >
                      Buy Residence
                    </button>
                    <button
                      type="button"
                      onClick={() => setPurpose("rent")}
                      className={`py-3.5 rounded-xl font-bold text-xs border transition-all ${
                        purpose === "rent"
                          ? "bg-[#172B3A] text-white border-[#172B3A] shadow-xs"
                          : "bg-[#F7F5F0] text-[#24313A] border-[#DCE2E5] hover:bg-gray-100"
                      }`}
                    >
                      Lease Residence (Rent)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#172B3A] uppercase tracking-wider block mb-1">
                      2. Preferred Region / Locality
                    </label>
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-[#F7F5F0] border border-[#DCE2E5] rounded-xl p-3 text-xs font-semibold text-[#24313A] focus:outline-none focus:border-[#315C4B]"
                    >
                      <option value="Ahmedabad">Ahmedabad</option>
                      <option value="Bodakdev">Bodakdev</option>
                      <option value="Satellite">Satellite</option>
                      <option value="Bopal">Bopal</option>
                      <option value="Surat">Surat</option>
                      <option value="Vadodara">Vadodara</option>
                      <option value="Gandhinagar">Gandhinagar</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#172B3A] uppercase tracking-wider block mb-1">
                      3. Architectural Type
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full bg-[#F7F5F0] border border-[#DCE2E5] rounded-xl p-3 text-xs font-semibold text-[#24313A] focus:outline-none focus:border-[#315C4B]"
                    >
                      <option value="Villa">Luxury Villa</option>
                      <option value="Apartment">Apartment</option>
                      <option value="Penthouse">Sky Penthouse</option>
                      <option value="Commercial">Commercial</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#172B3A] uppercase tracking-wider block mb-1">
                      4. Minimum Bedroom Configuration
                    </label>
                    <select
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      className="w-full bg-[#F7F5F0] border border-[#DCE2E5] rounded-xl p-3 text-xs font-semibold text-[#24313A] focus:outline-none focus:border-[#315C4B]"
                    >
                      <option value="2">2+ BHK</option>
                      <option value="3">3+ BHK</option>
                      <option value="4">4+ BHK</option>
                      <option value="5">5+ BHK</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#172B3A] uppercase tracking-wider block mb-1">
                      5. Target Maximum Budget
                    </label>
                    <select
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(e.target.value)}
                      className="w-full bg-[#F7F5F0] border border-[#DCE2E5] rounded-xl p-3 text-xs font-semibold text-[#24313A] focus:outline-none focus:border-[#315C4B]"
                    >
                      <option value="7500000">Up to ₹ 75 Lakh</option>
                      <option value="15000000">Up to ₹ 1.5 Crore</option>
                      <option value="25000000">Up to ₹ 2.5 Crore</option>
                      <option value="50000000">Up to ₹ 5.0 Crore</option>
                      <option value="100000000">Up to ₹ 10.0 Crore</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#172B3A] uppercase tracking-wider block mb-2">
                    6. Desired Lifestyle Amenities
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Smart Home",
                      "Private Garden",
                      "Swimming Pool",
                      "24/7 Security",
                      "Terrace Deck",
                      "EV Charging Station",
                      "Gym / Clubhouse",
                    ].map((pref) => {
                      const isSelected = preferences.includes(pref);
                      return (
                        <button
                          key={pref}
                          type="button"
                          onClick={() => togglePreference(pref)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center space-x-1.5 ${
                            isSelected
                              ? "bg-emerald-50 text-[#315C4B] border-emerald-300 font-bold"
                              : "bg-[#F7F5F0] text-[#24313A] border-[#DCE2E5] hover:bg-gray-100"
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#315C4B]" />}
                          <span>{pref}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loadingMatch}
                  className="w-full bg-[#315C4B] hover:bg-[#254639] disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl text-xs sm:text-sm transition-all shadow-subtle border border-forest-800 flex items-center justify-center space-x-2 active:scale-98"
                >
                  {loadingMatch ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#D5AD72]" />
                      <span>Scoring Genuine Listings with Gemini AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#D5AD72]" />
                      <span>Compute Verified AI Matches</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Calculated Results */}
            {isCalculated && (
              <div className="space-y-6 pt-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-[#DCE2E5] pb-4">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-[#172B3A]">
                      AI Matched Residences
                    </h3>
                    <p className="text-xs text-[#596873] font-sans">
                      Scored and reasoned against active catalog listings
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-[#315C4B] border border-emerald-200 rounded-lg text-xs font-bold">
                    {recommendedResults.length} Qualified Residences
                  </span>
                </div>

                {recommendedResults.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-[#DCE2E5] space-y-3">
                    <p className="text-sm font-semibold text-[#172B3A]">
                      No properties found matching this exact combination.
                    </p>
                    <p className="text-xs text-gray-500">
                      Try expanding your budget allocation or selecting "All Locations".
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendedResults.map((property) => (
                      <div key={property._id || property.id} className="flex flex-col space-y-2">
                        <PropertyCard property={property} />
                        {property.aiRationale && (
                          <div className="p-3 bg-white rounded-xl border border-[#DCE2E5] text-[11px] text-[#24313A] shadow-2xs space-y-1">
                            <div className="flex items-center space-x-1.5 text-[#315C4B] font-bold">
                              <Sparkles className="w-3.5 h-3.5 text-[#D5AD72]" />
                              <span>AI Match Rationale</span>
                              {property.aiMatchScore && (
                                <span className="ml-auto text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold">
                                  {property.aiMatchScore}% Match
                                </span>
                              )}
                            </div>
                            <p className="text-[#596873] leading-relaxed">
                              {property.aiRationale}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PRICE VALUATION ESTIMATOR */}
        {activeTab === "valuation" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xs border border-[#DCE2E5] max-w-4xl mx-auto space-y-6">
              <div className="flex items-center space-x-3 border-b border-[#DCE2E5] pb-4">
                <Calculator className="w-6 h-6 text-[#315C4B]" />
                <div>
                  <h2 className="text-lg sm:text-xl font-heading font-bold text-[#172B3A]">
                    HomeHub Fair Market Valuation Model
                  </h2>
                  <p className="text-xs text-[#596873]">
                    Estimates market valuation by analyzing real comparable listings and architectural characteristics
                  </p>
                </div>
              </div>

              {valError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
                  {valError}
                </div>
              )}

              <form onSubmit={handleCalculateValuation} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#172B3A] uppercase tracking-wider block mb-1">
                      City
                    </label>
                    <select
                      value={valCity}
                      onChange={(e) => setValCity(e.target.value)}
                      className="w-full bg-[#F7F5F0] border border-[#DCE2E5] rounded-xl p-3 text-xs font-semibold text-[#24313A] focus:outline-none focus:border-[#315C4B]"
                    >
                      <option value="Ahmedabad">Ahmedabad</option>
                      <option value="Surat">Surat</option>
                      <option value="Vadodara">Vadodara</option>
                      <option value="Gandhinagar">Gandhinagar</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#172B3A] uppercase tracking-wider block mb-1">
                      Locality / Sub-market
                    </label>
                    <input
                      type="text"
                      value={valLocality}
                      onChange={(e) => setValLocality(e.target.value)}
                      placeholder="e.g. Bodakdev, Satellite, Bopal"
                      required
                      className="w-full bg-[#F7F5F0] border border-[#DCE2E5] rounded-xl p-3 text-xs font-semibold text-[#24313A] focus:outline-none focus:border-[#315C4B]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#172B3A] uppercase tracking-wider block mb-1">
                      Property Type
                    </label>
                    <select
                      value={valType}
                      onChange={(e) => setValType(e.target.value)}
                      className="w-full bg-[#F7F5F0] border border-[#DCE2E5] rounded-xl p-3 text-xs font-semibold text-[#24313A] focus:outline-none focus:border-[#315C4B]"
                    >
                      <option value="Apartment">Apartment</option>
                      <option value="Villa">Luxury Villa</option>
                      <option value="Penthouse">Sky Penthouse</option>
                      <option value="Commercial">Commercial Space</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#172B3A] uppercase tracking-wider block mb-1">
                      Carpet Area (sq.ft)
                    </label>
                    <input
                      type="number"
                      value={valArea}
                      onChange={(e) => setValArea(e.target.value)}
                      placeholder="e.g. 2400"
                      min="100"
                      required
                      className="w-full bg-[#F7F5F0] border border-[#DCE2E5] rounded-xl p-3 text-xs font-semibold text-[#24313A] focus:outline-none focus:border-[#315C4B]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#172B3A] uppercase tracking-wider block mb-1">
                      Market Context
                    </label>
                    <select
                      value={valPurpose}
                      onChange={(e) => setValPurpose(e.target.value)}
                      className="w-full bg-[#F7F5F0] border border-[#DCE2E5] rounded-xl p-3 text-xs font-semibold text-[#24313A] focus:outline-none focus:border-[#315C4B]"
                    >
                      <option value="buy">Capital Purchase (Sale Value)</option>
                      <option value="rent">Rental Lease (Monthly Rent)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#172B3A] uppercase tracking-wider block mb-1">
                      Bedrooms
                    </label>
                    <select
                      value={valBedrooms}
                      onChange={(e) => setValBedrooms(e.target.value)}
                      className="w-full bg-[#F7F5F0] border border-[#DCE2E5] rounded-xl p-3 text-xs font-semibold text-[#24313A] focus:outline-none focus:border-[#315C4B]"
                    >
                      <option value="1">1 BHK</option>
                      <option value="2">2 BHK</option>
                      <option value="3">3 BHK</option>
                      <option value="4">4 BHK</option>
                      <option value="5">5+ BHK</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#172B3A] uppercase tracking-wider block mb-1">
                      Bathrooms
                    </label>
                    <select
                      value={valBathrooms}
                      onChange={(e) => setValBathrooms(e.target.value)}
                      className="w-full bg-[#F7F5F0] border border-[#DCE2E5] rounded-xl p-3 text-xs font-semibold text-[#24313A] focus:outline-none focus:border-[#315C4B]"
                    >
                      <option value="1">1 Bath</option>
                      <option value="2">2 Baths</option>
                      <option value="3">3 Baths</option>
                      <option value="4">4 Baths</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={valLoading}
                  className="w-full bg-[#315C4B] hover:bg-[#254639] disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl text-xs sm:text-sm transition-all shadow-subtle border border-forest-800 flex items-center justify-center space-x-2 active:scale-98"
                >
                  {valLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#D5AD72]" />
                      <span>Calibrating Real Market Comps...</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4 text-[#D5AD72]" />
                      <span>Compute Fair Valuation Estimate</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Valuation Results Display */}
            {valuationResult && (
              valuationResult.status === "INSUFFICIENT_DATA" ? (
                <div className="max-w-4xl mx-auto bg-amber-50 rounded-3xl p-6 sm:p-8 border border-amber-200 text-center space-y-3 animate-in fade-in duration-200">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                    <Info className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-heading font-extrabold text-amber-900">
                    Insufficient Data to Estimate Reliably
                  </h3>
                  <p className="text-xs text-amber-800 max-w-lg mx-auto">
                    {valuationResult.disclaimer || "No verified comparable properties matching this type, city, and transaction purpose were found in the database. HomeHub prioritizes factual accuracy over automated fabrication."}
                  </p>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-[#DCE2E5] shadow-xs space-y-6 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCE2E5] pb-5">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#315C4B] bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                        Indicative Market Estimate
                      </span>
                      <h3 className="text-2xl font-heading font-extrabold text-[#172B3A] mt-2">
                        Fair Market Valuation Range
                      </h3>
                      <p className="text-xs text-[#596873]">
                        Calibrated strictly against {valuationResult.comparablesUsed || 0} verified comparable listings in {valCity}
                      </p>
                    </div>

                    <div className="bg-[#172B3A] text-white px-5 py-3 rounded-2xl text-center border border-[#243E53]">
                      <span className="text-[10px] text-gray-300 uppercase tracking-wider block">
                        Estimated Valuation
                      </span>
                      <span className="text-xl sm:text-2xl font-heading font-extrabold text-[#D5AD72]">
                        {valuationResult.valuationRange?.formattedEstimated || formatPrice(valuationResult.estimatedValue)}
                      </span>
                    </div>
                  </div>

                  {/* Metric Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-[#F7F5F0] rounded-2xl border border-[#DCE2E5]">
                      <span className="text-[10px] uppercase font-bold text-[#596873] block mb-1">
                        Expected Valuation Range
                      </span>
                      <span className="text-sm font-extrabold text-[#172B3A] block">
                        {valuationResult.valuationRange?.formattedMin && valuationResult.valuationRange?.formattedMax
                          ? `${valuationResult.valuationRange.formattedMin} – ${valuationResult.valuationRange.formattedMax}`
                          : "Within market standard"}
                      </span>
                    </div>

                    <div className="p-4 bg-[#F7F5F0] rounded-2xl border border-[#DCE2E5]">
                      <span className="text-[10px] uppercase font-bold text-[#596873] block mb-1">
                        Locality Rate / sq.ft
                      </span>
                      <span className="text-sm font-extrabold text-[#172B3A] block">
                        ₹ {Number(valuationResult.avgRatePerSqFt || 0).toLocaleString("en-IN")} / sq.ft
                      </span>
                    </div>

                    <div className="p-4 bg-[#F7F5F0] rounded-2xl border border-[#DCE2E5]">
                      <span className="text-[10px] uppercase font-bold text-[#596873] block mb-1">
                        Data Source
                      </span>
                      <span className="text-sm font-extrabold text-emerald-700 flex items-center space-x-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>{valuationResult.comparablesUsed || 0} Verified DB Comps</span>
                      </span>
                    </div>
                  </div>

                  {/* Sample Comparables Analyzed */}
                  {valuationResult.comparablesSample && valuationResult.comparablesSample.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#172B3A]">
                        Live Database Comparables Analyzed
                      </h4>
                      <div className="space-y-2">
                        {valuationResult.comparablesSample.map((comp, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-white border border-[#DCE2E5] rounded-xl text-xs"
                          >
                            <div>
                              <span className="font-bold text-[#172B3A]">{comp.title}</span>
                              <span className="text-gray-500 block text-[11px]">{comp.location}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-extrabold text-[#315C4B]">{formatPrice(comp.price)}</span>
                              <span className="text-gray-400 block text-[10px]">
                                ₹ {comp.ratePerSqFt?.toLocaleString("en-IN")}/sq.ft
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Official Disclaimer */}
                  <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start space-x-3 text-xs text-amber-900">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <span className="font-bold block mb-0.5">Indicative Estimate Disclaimer</span>
                      <span>
                        {valuationResult.disclaimer ||
                          "This estimate represents an indicative algorithmic calculation based strictly on verified HomeHub catalog comparables. Not a certified financial or bank appraisal."}
                      </span>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIRecommendations;
