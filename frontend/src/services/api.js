import api from "../api/api";

// Auth API endpoints using Axios
export const authApi = {
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  resetPassword: async ({ email, phone, newPassword }) => {
    const response = await api.post("/auth/reset-password", { email, phone, newPassword });
    return response.data;
  },

  resetPasswordWithOtp: async (data) => {
    const response = await api.post("/auth/reset-password", data);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },
};

// User API endpoints
export const userApi = {
  getMe: async () => {
    const response = await api.get("/users/me");
    return response.data;
  },

  getAgents: async () => {
    const response = await api.get("/users/agents");
    return response.data;
  },

  getAgentClients: async () => {
    const response = await api.get("/users/agent/clients");
    return response.data?.clients || response.data?.data || response.data;
  },

  updateMe: async (userData) => {
    const response = await api.put("/users/me", userData);
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get("/users");
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post("/users", userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

// Property API endpoints using Axios
export const propertyApi = {
  getAll: async (params = {}) => {
    const response = await api.get("/properties", { params });
    return response.data?.data || response.data?.properties || response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/properties/${id}`);
    return response.data?.data || response.data;
  },

  create: async (propertyData) => {
    const response = await api.post("/properties", propertyData);
    return response.data?.data || response.data;
  },

  update: async (id, propertyData) => {
    const response = await api.put(`/properties/${id}`, propertyData);
    return response.data?.data || response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/properties/${id}`);
    return response.data;
  },

  getMyProperties: async () => {
    const response = await api.get("/properties/my-properties");
    return response.data?.data || response.data?.properties || response.data;
  },

  getMyListings: async () => {
    const response = await api.get("/properties/my-listings");
    return response.data?.data || response.data?.properties || response.data;
  },
};

// Appointment API endpoints
export const appointmentApi = {
  create: async (appointmentData) => {
    const response = await api.post("/appointments", appointmentData);
    return response.data?.data || response.data;
  },

  getMyAppointments: async () => {
    const response = await api.get("/appointments/my");
    return response.data?.data || response.data?.appointments || response.data;
  },

  getAgentAppointments: async () => {
    const response = await api.get("/appointments/agent");
    return response.data?.data || response.data?.appointments || response.data;
  },

  getAllAppointments: async () => {
    const response = await api.get("/appointments/all");
    return response.data?.data || response.data?.appointments || response.data;
  },

  cancelAppointment: async (id, cancellationReason = "Cancelled by agent") => {
    const response = await api.put(`/appointments/${id}/cancel`, { cancellationReason });
    return response.data?.data || response.data;
  },

  confirmAppointment: async (id) => {
    const response = await api.put(`/appointments/${id}`, { status: "confirmed" });
    return response.data?.data || response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.put(`/appointments/${id}`, { status });
    return response.data?.data || response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  },
};

// Inquiry API endpoints
export const inquiryApi = {
  create: async (inquiryData) => {
    const response = await api.post("/inquiries", inquiryData);
    return response.data?.data || response.data;
  },

  getMyInquiries: async () => {
    try {
      const response = await api.get("/inquiries");
      return response.data;
    } catch (e) {
      return [];
    }
  },

  getAllInquiries: async () => {
    try {
      const response = await api.get("/inquiries/all");
      return response.data?.data || response.data?.inquiries || response.data;
    } catch (e) {
      return [];
    }
  },

  updateStatus: async (id, status, responseText = "") => {
    const payload = { status };
    if (responseText && responseText.trim() !== "") {
      payload.response = responseText.trim();
    }
    const response = await api.put(`/inquiries/${id}`, payload);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/inquiries/${id}`);
    return response.data;
  },
};


// Wishlist API endpoints
export const wishlistApi = {
  getWishlist: async () => {
    try {
      const response = await api.get("/wishlist");
      return response.data;
    } catch (e) {
      return [];
    }
  },

  toggleWishlist: async (propertyId) => {
    try {
      const response = await api.post("/wishlist/toggle", { propertyId });
      return response.data;
    } catch (e) {
      return [];
    }
  },
};

// Offer & Bidding API endpoints
export const offerApi = {
  submitOffer: async ({ propertyId, amount, note }) => {
    const response = await api.post("/offers", { propertyId, amount, note });
    return response.data;
  },

  getMyOffers: async () => {
    try {
      const response = await api.get("/offers/my");
      return response.data?.data || response.data || [];
    } catch (err) {
      return [];
    }
  },

  getSellerOffers: async () => {
    try {
      const response = await api.get("/offers/seller");
      return response.data?.data || response.data || [];
    } catch (err) {
      return [];
    }
  },

  getAgentOffers: async () => {
    try {
      const response = await api.get("/offers/agent");
      return response.data?.data || response.data || [];
    } catch (err) {
      return [];
    }
  },

  getAdminOffers: async () => {
    try {
      const response = await api.get("/offers/admin");
      return response.data?.data || response.data || [];
    } catch (err) {
      return [];
    }
  },

  getOfferById: async (id) => {
    const response = await api.get(`/offers/${id}`);
    return response.data?.data || response.data;
  },

  acceptOffer: async (id, note = "") => {
    const response = await api.put(`/offers/${id}/accept`, { note });
    return response.data;
  },

  rejectOffer: async (id, note = "") => {
    const response = await api.put(`/offers/${id}/reject`, { note });
    return response.data;
  },

  counterOffer: async (id, { counterAmount, counterNote }) => {
    const response = await api.put(`/offers/${id}/counter`, { counterAmount, counterNote });
    return response.data;
  },

  withdrawOffer: async (id, reason = "") => {
    const response = await api.put(`/offers/${id}/withdraw`, { reason });
    return response.data;
  },

  respondToCounter: async (id, action) => {
    const response = await api.put(`/offers/${id}/respond-counter`, { action });
    return response.data;
  },
};

// AI Services API endpoints
export const aiApi = {
  sendChat: async (message, conversationHistory = []) => {
    try {
      const response = await api.post("/ai/chat", { message, conversationHistory });
      return response.data;
    } catch (e) {
      return {
        success: false,
        reply: e.response?.data?.message || "Our AI Assistant is currently experiencing high demand. Please try again shortly.",
      };
    }
  },

  smartSearch: async (query) => {
    try {
      const response = await api.post("/ai/smart-search", { query });
      return response.data;
    } catch (e) {
      return {
        success: false,
        properties: [],
        parsedFilters: {},
        message: e.response?.data?.message || "Smart search encountered an error.",
      };
    }
  },

  getRecommendations: async (quizData) => {
    try {
      const response = await api.post("/ai/recommendations", quizData);
      return response.data;
    } catch (e) {
      return { success: false, recommendations: [] };
    }
  },

  generateDescription: async (propertySpecs) => {
    const response = await api.post("/ai/generate-description", propertySpecs);
    return response.data;
  },

  getValuation: async (valuationData) => {
    try {
      const response = await api.post("/ai/valuation", valuationData);
      return response.data;
    } catch (e) {
      return {
        success: false,
        message: e.response?.data?.message || "Valuation service unavailable.",
      };
    }
  },
};

// Visitor Analytics API endpoints (Tracks logged in & anonymous guest views)
export const visitorApi = {
  logVisit: async (logData) => {
    try {
      const response = await api.post("/visitors/log", logData);
      return response.data;
    } catch (e) {
      return { success: false };
    }
  },

  getAllVisitorLogs: async () => {
    try {
      const response = await api.get("/visitors/all");
      return response.data;
    } catch (e) {
      return { success: false, logs: [], stats: { totalViews: 0, loggedInCount: 0, guestCount: 0, uniqueIps: 0 } };
    }
  },

  clearLogs: async () => {
    try {
      const response = await api.delete("/visitors/clear");
      return response.data;
    } catch (e) {
      return { success: false };
    }
  },
};

// Notification API endpoints (In-App notifications for Bids, Inquiries, Appointments)
export const notificationApi = {
  getMyNotifications: async (params = {}) => {
    try {
      const response = await api.get("/notifications", { params });
      return response.data?.data || response.data?.notifications || response.data || [];
    } catch (e) {
      return [];
    }
  },

  getUnreadCount: async () => {
    try {
      const response = await api.get("/notifications/unread-count");
      return response.data?.unreadCount || 0;
    } catch (e) {
      return 0;
    }
  },

  markAsRead: async (id) => {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      return response.data;
    } catch (e) {
      return { success: false };
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await api.put("/notifications/mark-all-read");
      return response.data;
    } catch (e) {
      return { success: false };
    }
  },

  deleteNotification: async (id) => {
    try {
      const response = await api.delete(`/notifications/${id}`);
      return response.data;
    } catch (e) {
      return { success: false };
    }
  },
};
