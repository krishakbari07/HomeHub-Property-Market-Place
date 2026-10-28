import React, { createContext, useContext, useState, useEffect } from "react";
import {
  propertyApi,
  wishlistApi,
  inquiryApi,
  appointmentApi,
} from "../services/api";
import { useAuth } from "./AuthContext";

const PropertyContext = createContext();

export const PropertyProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  const [properties, setProperties] = useState([]);
  const [myProperties, setMyProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [wishlistIds, setWishlistIds] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState("Please login or create an account to continue.");

  // Fetch properties from backend API on mount
  useEffect(() => {
    fetchProperties();
  }, []);

  // Fetch user's own properties, wishlist, inquiries & appointments + real-time auto sync
  useEffect(() => {
    if (!isAuthenticated) {
      setMyProperties([]);
      setAppointments([]);
      setInquiries([]);
      setWishlistIds([]);
      return;
    }

    let lastSyncTime = 0;
    const syncUserData = () => {
      // Throttle syncs to prevent burst calls
      const now = Date.now();
      if (now - lastSyncTime < 2000) return;
      lastSyncTime = now;

      fetchMyProperties();
      fetchMyAppointments();
      fetchMyInquiries();
      fetchWishlist();
    };

    // Initial sync on auth
    syncUserData();

    // Event-based syncing on tab focus and window visibility
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        syncUserData();
      }
    };

    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);
    window.addEventListener("homehub_appointment_updated", syncUserData);
    window.addEventListener("homehub_inquiry_updated", syncUserData);

    // Gentle 60-second background polling fallback (only active when tab is visible)
    const autoSyncTimer = setInterval(() => {
      if (document.visibilityState === "visible") {
        syncUserData();
      }
    }, 60000);

    return () => {
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.removeEventListener("homehub_appointment_updated", syncUserData);
      window.removeEventListener("homehub_inquiry_updated", syncUserData);
      clearInterval(autoSyncTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAuthenticated]);

  // Read All Properties from MongoDB Atlas API
  const fetchProperties = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await propertyApi.getAll(params);
      const list = Array.isArray(data) ? data : [];
      setProperties(list);
      return list;
    } catch (err) {
      console.error("Error fetching properties from API:", err);
      const errMsg = err.response?.data?.message || err.message || "Failed to load properties";
      setError(errMsg);
      setProperties([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Read My Properties (Logged-in User) from MongoDB Atlas API
  const fetchMyProperties = async () => {
    if (!isAuthenticated) return [];
    try {
      const data = await propertyApi.getMyProperties();
      const list = Array.isArray(data) ? data : [];
      setMyProperties(list);
      return list;
    } catch (err) {
      console.error("Error fetching my properties:", err);
      return [];
    }
  };

  // Read Single Property by ID
  const fetchPropertyById = async (id) => {
    try {
      const data = await propertyApi.getById(id);
      return data;
    } catch (err) {
      console.error("Error fetching property details:", err);
      throw err;
    }
  };

  // Create Property via Express API -> MongoDB Atlas
  const addProperty = async (newPropertyObj) => {
    setLoading(true);
    try {
      const created = await propertyApi.create(newPropertyObj);
      await fetchProperties();
      await fetchMyProperties();
      return created;
    } catch (err) {
      console.error("Error adding property:", err);
      throw new Error(err.response?.data?.message || err.message || "Failed to create property");
    } finally {
      setLoading(false);
    }
  };

  // Update Property via Express API -> MongoDB Atlas
  const updateProperty = async (id, updatedData) => {
    setLoading(true);
    try {
      const updated = await propertyApi.update(id, updatedData);
      setProperties((prev) =>
        prev.map((p) => ((p._id || p.id) === id ? { ...p, ...updated } : p))
      );
      setMyProperties((prev) =>
        prev.map((p) => ((p._id || p.id) === id ? { ...p, ...updated } : p))
      );
      await fetchProperties();
      await fetchMyProperties();
      return updated;
    } catch (err) {
      console.error("Error updating property:", err);
      throw new Error(err.response?.data?.message || err.message || "Failed to update property");
    } finally {
      setLoading(false);
    }
  };

  // Delete Property via Express API -> MongoDB Atlas
  const deleteProperty = async (id) => {
    setLoading(true);
    try {
      await propertyApi.delete(id);
      setProperties((prev) => prev.filter((p) => (p._id || p.id) !== id));
      setMyProperties((prev) => prev.filter((p) => (p._id || p.id) !== id));
      return true;
    } catch (err) {
      console.error("Error deleting property:", err);
      throw new Error(err.response?.data?.message || err.message || "Failed to delete property");
    } finally {
      setLoading(false);
    }
  };

  // Wishlist Actions
  const fetchWishlist = async () => {
    if (!isAuthenticated) return [];
    try {
      const res = await wishlistApi.getWishlist();
      const list = Array.isArray(res) ? res : res.wishlist || res.data || [];
      const ids = list.map((item) =>
        typeof item === "object" ? (item._id || item.id || item.property)?.toString() : item?.toString()
      );
      setWishlistIds(ids);
      return ids;
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      return [];
    }
  };

  const toggleWishlist = async (propertyId) => {
    if (!isAuthenticated) {
      triggerAuthModal("Please login or create an account to save properties to your wishlist. You can view all property details without logging in!");
      return;
    }
    if (!propertyId) return;
    const pidStr = propertyId.toString();

    // Optimistic toggle locally
    setWishlistIds((prev) => {
      const exists = prev.some((id) => id === pidStr);
      if (exists) {
        return prev.filter((id) => id !== pidStr);
      } else {
        return [...prev, pidStr];
      }
    });

    try {
      const res = await wishlistApi.toggleWishlist(propertyId);
      if (Array.isArray(res)) {
        const ids = res.map((p) =>
          typeof p === "object" ? (p._id || p.id || p.property)?.toString() : p?.toString()
        );
        setWishlistIds(ids);
      }
    } catch (err) {
      console.warn("Wishlist API sync note:", err.message);
    }
  };

  const isInWishlist = (propertyId) => {
    if (!propertyId) return false;
    const pidStr = propertyId.toString();
    return wishlistIds.some((id) => id === pidStr);
  };

  const wishlistProperties = properties.filter((p) => isInWishlist(p._id || p.id));

  // Inquiry Actions
  const fetchMyInquiries = async () => {
    if (!isAuthenticated) return [];
    try {
      const data = await inquiryApi.getMyInquiries();
      const list = Array.isArray(data) ? data : [];
      setInquiries(list);
      return list;
    } catch (err) {
      console.error("Error fetching inquiries:", err);
      return [];
    }
  };

  const submitInquiry = async (inquiryData) => {
    if (!isAuthenticated) {
      triggerAuthModal("Please login or create an account to send an inquiry to the owner/agent. You can view all property details without logging in!");
      throw new Error("Authentication required to submit an inquiry.");
    }
    const res = await inquiryApi.create(inquiryData);
    await fetchMyInquiries();
    window.dispatchEvent(new Event("homehub_inquiry_updated"));
    return res;
  };

  // Appointment Actions
  const fetchMyAppointments = async () => {
    if (!isAuthenticated) return [];
    try {
      const data = await appointmentApi.getMyAppointments();
      const list = Array.isArray(data) ? data : [];
      setAppointments(list);
      return list;
    } catch (err) {
      console.error("Error fetching appointments:", err);
      return [];
    }
  };

  const scheduleVisit = async (appointmentData) => {
    if (!isAuthenticated) {
      triggerAuthModal("Please login or create an account to book an appointment for a property visit. You can watch and browse all properties without logging in!");
      throw new Error("Authentication required to book an appointment.");
    }
    const res = await appointmentApi.create(appointmentData);
    await fetchMyAppointments();
    window.dispatchEvent(new Event("homehub_appointment_updated"));
    return res;
  };

  const cancelAppointment = async (id, reason) => {
    const res = await appointmentApi.cancelAppointment(id, reason);
    await fetchMyAppointments();
    window.dispatchEvent(new Event("homehub_appointment_updated"));
    return res;
  };

  const triggerAuthModal = (message = "Please login or create an account to continue.") => {
    setAuthModalMessage(message);
    setAuthModalOpen(true);
  };

  return (
    <PropertyContext.Provider
      value={{
        properties,
        myProperties,
        loading,
        error,
        fetchProperties,
        fetchMyProperties,
        fetchPropertyById,
        addProperty,
        updateProperty,
        deleteProperty,
        wishlistIds,
        wishlistProperties,
        fetchWishlist,
        toggleWishlist,
        isInWishlist,
        inquiries,
        fetchMyInquiries,
        submitInquiry,
        appointments,
        fetchMyAppointments,
        scheduleVisit,
        cancelAppointment,
        authModalOpen,
        setAuthModalOpen,
        authModalMessage,
        triggerAuthModal,
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperty = () => useContext(PropertyContext);
