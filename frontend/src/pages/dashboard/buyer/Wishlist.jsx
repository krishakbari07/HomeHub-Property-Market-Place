import React from "react";
import { Heart } from "lucide-react";
import { useProperty } from "../../../context/PropertyContext";
import PropertyCard from "../../../components/common/PropertyCard";
import EmptyState from "../../../components/common/EmptyState";

const Wishlist = () => {
  const { wishlistProperties } = useProperty();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 border border-ivory-300 shadow-subtle flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-navy-900 tracking-tight">
            Saved Wishlist Portfolio
          </h1>
          <p className="text-navy-500 text-xs sm:text-sm font-sans">
            Review your shortlisted properties, compare specifications, and arrange visits.
          </p>
        </div>
        <div className="w-12 h-12 bg-ivory-100 text-forest-700 border border-ivory-300 rounded-2xl flex items-center justify-center font-bold shadow-subtle">
          <Heart className="w-6 h-6 fill-forest-700 text-forest-700" />
        </div>
      </div>

      {/* Grid */}
      {wishlistProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {wishlistProperties.map((property) => (
            <PropertyCard key={property._id || property.id} property={property} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Your Shortlist is Currently Empty"
          description="Save properties you are interested in by clicking the heart button on any property listing."
          actionText="Browse Luxury Properties"
          actionLink="/buy"
          icon={Heart}
        />
      )}
    </div>
  );
};

export default Wishlist;
