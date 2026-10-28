import React from "react";
import { TrendingUp, Users, CheckCircle2 } from "lucide-react";

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Agent Performance Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Listing impressions, leads conversion, and deal pipeline.</p>
        </div>
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold">
          <TrendingUp className="w-6 h-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <Users className="w-6 h-6 text-indigo-600" />
          <span className="text-2xl font-extrabold block text-gray-900">48</span>
          <span className="text-xs text-gray-500 font-semibold">Active CRM Clients</span>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          <span className="text-2xl font-extrabold block text-gray-900">18 Deals</span>
          <span className="text-xs text-gray-500 font-semibold">Closed This Quarter</span>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <TrendingUp className="w-6 h-6 text-purple-600" />
          <span className="text-2xl font-extrabold block text-gray-900">₹14.5 Cr</span>
          <span className="text-xs text-gray-500 font-semibold">Gross Transaction Volume</span>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
