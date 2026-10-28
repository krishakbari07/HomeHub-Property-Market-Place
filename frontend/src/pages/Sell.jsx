import React, { useState } from "react";
import { Sparkles, CheckCircle2, Home, Calculator } from "lucide-react";

const Sell = () => {
  const [formData, setFormData] = useState({
    title: "",
    city: "Ahmedabad",
    locality: "",
    type: "Apartment",
    purpose: "buy",
    bedrooms: "3",
    bathrooms: "3",
    area: "1500",
    expectedPrice: ""
  });

  const [aiPriceEstimate, setAiPriceEstimate] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const calculateAiValuation = () => {
    const areaNum = parseFloat(formData.area) || 1000;
    const baseRatePerSqft = formData.city === "Ahmedabad" ? 8500 : formData.city === "Surat" ? 7500 : 6500;
    const estimatedValue = areaNum * baseRatePerSqft;
    const minVal = (estimatedValue * 0.95 / 100000).toFixed(2);
    const maxVal = (estimatedValue * 1.08 / 100000).toFixed(2);
    setAiPriceEstimate({ minVal, maxVal });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Free AI Property Valuation</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">List Your Property</h1>
        <p className="text-sm text-gray-500 max-w-lg mx-auto">
          Fill out your property details to generate an instant AI valuation and list it for thousands of buyers.
        </p>
      </div>

      {submitted ? (
        <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Property Listed Successfully!</h2>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Your property listing has been created and verified by our AI algorithm. Interested buyers will contact you shortly.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm"
          >
            List Another Property
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-xl space-y-8">
          
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <Home className="w-5 h-5 text-indigo-600" />
              <span>Basic Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Property Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Modern 3BHK Apartment with Balcony"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">City</label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="Ahmedabad">Ahmedabad</option>
                  <option value="Surat">Surat</option>
                  <option value="Vadodara">Vadodara</option>
                  <option value="Gandhinagar">Gandhinagar</option>
                  <option value="Rajkot">Rajkot</option>
                  <option value="Bhavnagar">Bhavnagar</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Locality / Area</label>
                <input
                  type="text"
                  required
                  value={formData.locality}
                  onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                  placeholder="e.g. Satellite, SG Highway"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Property Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Penthouse">Penthouse</option>
                  <option value="Plot">Plot</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Listing Type</label>
                <select
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="buy">Sell Property</option>
                  <option value="rent">Rent Out Property</option>
                </select>
              </div>
            </div>
          </div>

          {/* Specs */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-indigo-600" />
              <span>Specs & AI Price Estimator</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Bedrooms</label>
                <input
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Bathrooms</label>
                <input
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Area (Sq.Ft)</label>
                <input
                  type="number"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4 pt-2">
              <button
                type="button"
                onClick={calculateAiValuation}
                className="px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-bold rounded-xl flex items-center space-x-2 transition"
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Estimate AI Valuation</span>
              </button>

              {aiPriceEstimate && (
                <div className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
                  Estimated Price Range: ₹ {aiPriceEstimate.minVal} Lakhs - ₹ {aiPriceEstimate.maxVal} Lakhs
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-6 border-t border-gray-100">
            <button
              type="submit"
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base rounded-2xl shadow-lg transition"
            >
              Submit Property Listing
            </button>
          </div>

        </form>
      )}

    </div>
  );
};

export default Sell;
