import React from "react";
import { Link } from "react-router-dom";
import { Heart, Bed, Bath, Maximize2, MapPin, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useProperty } from "../../context/PropertyContext";
import ImageWithFallback from "./ImageWithFallback";

const PropertyCard = ({ property }) => {
  const { isAuthenticated } = useAuth();
  const { isInWishlist, toggleWishlist, triggerAuthModal } = useProperty();

  if (!property) return null;

  const propId = property._id || property.id;
  const isFavorited = isInWishlist(propId);
  const isRent = property.purpose === "rent" || property.tag === "For Rent" || property.listingType === "rent";
  const displayPrice = property.formattedPrice || (isRent ? `₹${(property.monthlyRent || property.price)?.toLocaleString("en-IN")} /mo` : `₹${property.price?.toLocaleString("en-IN")}`);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      triggerAuthModal("Please sign up or login to save properties to your private wishlist.");
      return;
    }
    toggleWishlist(propId);
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-ivory-300 shadow-subtle card-hover-effect group flex flex-col h-full relative">
      {/* Property Visual */}
      <div className="relative aspect-[16/10] overflow-hidden bg-ivory-200">
        <Link to={`/property/${propId}`}>
          <ImageWithFallback
            src={property.image}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
          />
        </Link>

        {/* Status / Category Badges */}
        <div className="absolute top-3 left-3 flex items-center space-x-1.5 z-10">
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg shadow-subtle bg-navy-800 text-white">
            {property.badgeText || (isRent ? "For Rent" : "For Sale")}
          </span>
          {property.aiMatchScore && (
            <span className="px-2 py-1 text-[11px] font-bold bg-white/95 backdrop-blur-md text-forest-700 rounded-lg flex items-center space-x-1 shadow-subtle border border-forest-100">
              <Sparkles className="w-3 h-3 text-forest-700" />
              <span>{property.aiMatchScore}% Match</span>
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all shadow-subtle z-10 ${
            isFavorited
              ? "bg-rose-600 text-white hover:bg-rose-700 scale-105"
              : "bg-white/90 text-navy-700 hover:bg-white hover:text-rose-600"
          }`}
          title={isFavorited ? "Remove from Saved" : "Save to Wishlist"}
          aria-label="Wishlist toggle"
        >
          <Heart className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between space-y-3 text-left">
        <div className="space-y-1.5">
          {/* Price Header */}
          <div className="text-xl font-heading font-extrabold text-forest-700">
            {displayPrice}
          </div>

          {/* Title */}
          <Link
            to={`/property/${propId}`}
            className="block text-base font-heading font-bold text-navy-900 group-hover:text-forest-700 transition-colors line-clamp-1"
          >
            {property.title}
          </Link>

          {/* Location */}
          <div className="flex items-center text-xs text-navy-500 space-x-1">
            <MapPin className="w-3.5 h-3.5 text-navy-400 shrink-0" />
            <span className="truncate">{property.location || property.city || "Ahmedabad, Gujarat"}</span>
          </div>
        </div>

        {/* Specifications Strip */}
        <div className="pt-3 border-t border-ivory-200 flex items-center justify-between text-xs font-medium text-navy-600">
          <div className="flex items-center space-x-1">
            <Bed className="w-3.5 h-3.5 text-navy-400" />
            <span>{property.bedrooms || 3} Beds</span>
          </div>
          <div className="flex items-center space-x-1">
            <Bath className="w-3.5 h-3.5 text-navy-400" />
            <span>{property.bathrooms || 2} Baths</span>
          </div>
          <div className="flex items-center space-x-1">
            <Maximize2 className="w-3.5 h-3.5 text-navy-400" />
            <span>{property.areaSqFt || property.area || 1800} sq.ft</span>
          </div>
        </div>

        {/* Agent Information Strip if Present */}
        {property.agent && typeof property.agent === "object" && (
          <div className="pt-3 border-t border-ivory-200 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 min-w-0">
              <ImageWithFallback
                src={
                  property.agent.avatar ||
                  property.agent.profileImage ||
                  property.agent.image ||
                  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80"
                }
                alt={property.agent.name || "Agent"}
                className="w-6 h-6 rounded-full object-cover border border-ivory-300 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-navy-800 text-[11px] leading-tight truncate">
                  {property.agent.name || "Real Estate Advisor"}
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-ivory-200 text-navy-700 text-[10px] font-bold rounded-md shrink-0 ml-2">
              Advisor
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyCard;
