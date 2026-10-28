import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Building2, Users, MapPin, Award } from "lucide-react";
import PropertyCard from "../common/PropertyCard";
import { useProperty } from "../../context/PropertyContext";

const mockFallbackList = [
  {
    id: "mock-1",
    _id: "mock-1",
    title: "The Heritage Grand Villa",
    price: 32000000,
    formattedPrice: "₹ 3.20 Cr",
    location: "Bodakdev, Ahmedabad",
    city: "Ahmedabad",
    bedrooms: 4,
    bathrooms: 4,
    area: 3400,
    badgeText: "Featured",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "mock-2",
    _id: "mock-2",
    title: "Panoramic Sky Penthouse",
    price: 24500000,
    formattedPrice: "₹ 2.45 Cr",
    location: "Prahlad Nagar, Ahmedabad",
    city: "Ahmedabad",
    bedrooms: 3,
    bathrooms: 3,
    area: 2150,
    badgeText: "Featured",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "mock-3",
    _id: "mock-3",
    title: "Riverside Garden Estate",
    price: 19500000,
    formattedPrice: "₹ 1.95 Cr",
    location: "Shela, Ahmedabad",
    city: "Ahmedabad",
    bedrooms: 3,
    bathrooms: 3,
    area: 2500,
    badgeText: "New Listing",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  },
];

const FeaturedProperties = () => {
  const { properties } = useProperty();

  // Combine live MongoDB properties with fallback mocks if fewer than 3
  const liveProperties = Array.isArray(properties) ? properties : [];
  const combinedList = [...liveProperties];
  
  if (combinedList.length < 3) {
    mockFallbackList.forEach((mock) => {
      if (combinedList.length < 3 && !combinedList.some((p) => (p._id || p.id) === mock.id)) {
        combinedList.push(mock);
      }
    });
  }

  const featuredList = combinedList.slice(0, 3);

  return (
    <section className="py-16 sm:py-20 bg-ivory-50 border-y border-ivory-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-widest text-forest-700 block">
              Curated Selection
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-navy-900 tracking-tight">
              Featured Residences
            </h2>
            <p className="text-sm text-navy-600 font-sans">
              Hand-picked verified luxury properties with premium amenities and prime connectivity.
            </p>
          </div>
          <Link
            to="/buy"
            className="text-xs sm:text-sm font-bold text-forest-700 hover:text-forest-800 flex items-center space-x-1 transition-colors self-start sm:self-auto"
          >
            <span>Explore Entire Portfolio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 4-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
          {/* 3 Property Cards */}
          {featuredList.map((property) => (
            <PropertyCard key={property._id || property.id} property={property} />
          ))}

          {/* 4th Column: Architectural AI Recommendation Box + Stats Strip */}
          <div className="flex flex-col justify-between space-y-4">
            {/* AI Match Feature Box */}
            <div className="bg-navy-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-card border border-navy-800 flex flex-col justify-between space-y-6 flex-1">
              <div className="space-y-3 relative z-10 text-left">
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-navy-800 border border-gold-400/30 rounded-md text-[10px] font-bold uppercase tracking-wider text-gold-400">
                  <Sparkles className="w-3 h-3 text-gold-400" />
                  <span>AI Advisor</span>
                </span>
                <h3 className="text-xl font-heading font-extrabold leading-snug text-white">
                  Intelligent Property Matching
                </h3>
                <p className="text-xs text-navy-200 leading-relaxed font-sans">
                  Answer a few questions about your ideal location, budget, and lifestyle requirements to receive customized recommendations.
                </p>
              </div>

              <Link
                to="/ai-recommendations"
                className="w-full bg-forest-700 hover:bg-forest-800 text-white font-semibold py-3 px-4 rounded-xl text-center text-xs transition-all block relative z-10 border border-forest-600 shadow-subtle"
              >
                Launch AI Property Match
              </Link>
            </div>

            {/* Bottom Stats Card */}
            <div className="bg-white rounded-2xl border border-ivory-300 p-4 shadow-subtle grid grid-cols-4 gap-2 text-center">
              <div className="space-y-1">
                <Building2 className="w-4 h-4 text-forest-700 mx-auto" />
                <span className="text-sm font-heading font-extrabold text-navy-900 block">500+</span>
                <span className="text-[10px] text-navy-500 font-medium block">Verified</span>
              </div>
              <div className="space-y-1">
                <Users className="w-4 h-4 text-forest-700 mx-auto" />
                <span className="text-sm font-heading font-extrabold text-navy-900 block">1.2K+</span>
                <span className="text-[10px] text-navy-500 font-medium block">Buyers</span>
              </div>
              <div className="space-y-1">
                <MapPin className="w-4 h-4 text-forest-700 mx-auto" />
                <span className="text-sm font-heading font-extrabold text-navy-900 block">12</span>
                <span className="text-[10px] text-navy-500 font-medium block">Cities</span>
              </div>
              <div className="space-y-1">
                <Award className="w-4 h-4 text-gold-600 mx-auto" />
                <span className="text-sm font-heading font-extrabold text-navy-900 block">100%</span>
                <span className="text-[10px] text-navy-500 font-medium block">RERA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
