import React from "react";
import { TrendingUp, Eye, MousePointerClick } from "lucide-react";

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Seller Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Listing impression and lead performance analytics.</p>
        </div>
        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center font-bold">
          <TrendingUp className="w-6 h-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <Eye className="w-6 h-6 text-indigo-600" />
          <span className="text-2xl font-extrabold block text-gray-900">1,420</span>
          <span className="text-xs text-gray-500 font-semibold">Total Property Views</span>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <MousePointerClick className="w-6 h-6 text-purple-600" />
          <span className="text-2xl font-extrabold block text-gray-900">84</span>
          <span className="text-xs text-gray-500 font-semibold">Wishlist Adds</span>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <TrendingUp className="w-6 h-6 text-emerald-600" />
          <span className="text-2xl font-extrabold block text-gray-900">14.2%</span>
          <span className="text-xs text-gray-500 font-semibold">Inquiry Conversion Rate</span>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
