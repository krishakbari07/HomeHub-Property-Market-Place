import React from "react";
import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import PropertyCard from "../components/PropertyCard";
import { Heart, ArrowLeft } from "lucide-react";

const Wishlist = () => {
  const { wishlistProperties } = useWishlist();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center space-x-2 text-rose-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Heart className="w-4 h-4 fill-current" />
            <span>Saved Favorites</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Your Property Wishlist</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            {wishlistProperties.length} properties saved for future review
          </p>
        </div>

        <Link
          to="/properties"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Explore More Properties</span>
        </Link>
      </div>

      {/* Grid */}
      {wishlistProperties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Your wishlist is empty</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Click the heart icon on any property card to save it here and compare later.
          </p>
          <Link
            to="/properties"
            className="inline-block px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow"
          >
            Browse Properties
          </Link>
        </div>
      )}

    </div>
  );
};

export default Wishlist;
