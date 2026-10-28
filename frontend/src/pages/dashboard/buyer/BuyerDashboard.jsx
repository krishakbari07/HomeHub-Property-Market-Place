import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageSquare, Calendar, Sparkles, Search, Tag } from "lucide-react";
import { useProperty } from "../../../context/PropertyContext";
import { useAuth } from "../../../context/AuthContext";
import { offerApi } from "../../../services/api";
import PropertyCard from "../../../components/common/PropertyCard";
import DashboardCard from "../../../components/dashboard/DashboardCard";

const BuyerDashboard = () => {
  const { user } = useAuth();
  const { properties, fetchProperties, wishlistProperties, inquiries, appointments, loading } = useProperty();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterPurpose, setFilterPurpose] = useState("all");
  const [offersCount, setOffersCount] = useState(0);

  useEffect(() => {
    fetchProperties();
    offerApi
      .getMyOffers()
      .then((list) => setOffersCount((Array.isArray(list) ? list : []).length))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter properties fetched live from MongoDB Atlas API
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      // Sale / Rent Filter
      if (filterPurpose === "buy" && p.purpose !== "buy" && p.tag !== "For Sale" && p.listingType !== "buy") {
        return false;
      }
      if (filterPurpose === "rent" && p.purpose !== "rent" && p.tag !== "For Rent" && p.listingType !== "rent") {
        return false;
      }

      // Search term filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchTitle = p.title?.toLowerCase().includes(term);
        const matchLocation = p.location?.toLowerCase().includes(term);
        const matchCity = p.city?.toLowerCase().includes(term);
        const matchType = p.type?.toLowerCase().includes(term) || p.propertyType?.toLowerCase().includes(term);
        if (!matchTitle && !matchLocation && !matchCity && !matchType) {
          return false;
        }
      }

      return true;
    });
  }, [properties, filterPurpose, searchTerm]);

  return (
    <div className="space-y-8">
      {/* Executive Welcome Banner */}
      <div className="bg-navy-950 text-white rounded-3xl p-8 shadow-card border border-navy-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
            Client & Tenant Suite
          </span>
          <h1 className="text-3xl font-heading font-extrabold text-white tracking-tight">
            Welcome, {user?.name || "Client"}
          </h1>
          <p className="text-navy-200 text-sm font-sans max-w-xl">
            Explore verified luxury villas and residences published by certified agents and verified sellers.
          </p>
        </div>
        <Link
          to="/ai-recommendations"
          className="bg-forest-700 hover:bg-forest-800 text-white font-semibold px-6 py-3 rounded-xl shadow-subtle border border-forest-600 transition-all flex items-center space-x-2 text-xs shrink-0 active:scale-98"
        >
          <Sparkles className="w-4 h-4 text-gold-400" />
          <span>Launch AI Property Match</span>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <DashboardCard
          title="Bids & Offers"
          value={offersCount}
          change="Manage Submitted Bids"
          icon={Tag}
          color="gold"
          link="/buyer/offers"
        />
        <DashboardCard
          title="Saved Properties"
          value={wishlistProperties.length}
          change="Open Private Wishlist"
          icon={Heart}
          color="rose"
          link="/buyer/wishlist"
        />
        <DashboardCard
          title="Active Inquiries"
          value={inquiries.length}
          change="Track Inquiry Responses"
          icon={MessageSquare}
          color="navy"
          link="/buyer/inquiries"
        />
        <DashboardCard
          title="Scheduled Visits"
          value={appointments.length}
          change="Manage Visit Bookings"
          icon={Calendar}
          color="forest"
          link="/buyer/visits"
        />
      </div>

      {/* Live Marketplace Portfolio Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-300 shadow-subtle space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ivory-200 pb-5">
          <div>
            <h2 className="text-xl font-heading font-extrabold text-navy-900 tracking-tight">
              Verified Residences & Estates
            </h2>
            <p className="text-xs text-navy-500 font-sans mt-0.5">
              Showing {filteredProperties.length} verified properties available for acquisition or lease
            </p>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-navy-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter by locality or keyword..."
                className="bg-ivory-50 border border-ivory-300 rounded-xl pl-9 pr-3 py-1.5 text-xs font-semibold text-navy-900 focus:outline-none focus:border-forest-600"
              />
            </div>

            <div className="inline-flex p-1 bg-ivory-200 rounded-xl space-x-1 border border-ivory-300">
              <button
                onClick={() => setFilterPurpose("all")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterPurpose === "all" ? "bg-navy-800 text-white shadow-subtle" : "text-navy-700 hover:text-navy-900"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterPurpose("buy")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterPurpose === "buy" ? "bg-navy-800 text-white shadow-subtle" : "text-navy-700 hover:text-navy-900"
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setFilterPurpose("rent")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterPurpose === "rent" ? "bg-navy-800 text-white shadow-subtle" : "text-navy-700 hover:text-navy-900"
                }`}
              >
                Rent
              </button>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="py-12 text-center text-xs font-semibold text-navy-500">
            Refreshing verified property catalog...
          </div>
        ) : filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard key={property._id || property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center space-y-2">
            <p className="text-sm font-heading font-bold text-navy-800">No properties found</p>
            <p className="text-xs text-navy-500">Try clearing your search keyword or switching between Buy and Rent.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerDashboard;
