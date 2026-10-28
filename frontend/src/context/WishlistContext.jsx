import React, { createContext, useContext, useState } from "react";
import { properties } from "../data/properties";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  // Initialize with property ID 1 favorited by default
  const [wishlistIds, setWishlistIds] = useState([1, 3]);

  const toggleWishlist = (propertyId) => {
    setWishlistIds((prev) =>
      prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const isInWishlist = (propertyId) => wishlistIds.includes(propertyId);

  const wishlistProperties = properties.filter((p) => wishlistIds.includes(p.id));

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistProperties,
        toggleWishlist,
        isInWishlist,
        wishlistCount: wishlistIds.length
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
