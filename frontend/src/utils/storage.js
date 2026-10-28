// LocalStorage Cache Helper for HomeHub Client State

const KEYS = {
  USERS: "homehub_users",
  CURRENT_USER: "homehub_current_user",
  PROPERTIES: "homehub_properties",
  WISHLIST: "homehub_wishlist",
  INQUIRIES: "homehub_inquiries",
  APPOINTMENTS: "homehub_appointments",
};

// Helper for safe JSON parse
const getItem = (key, fallback = []) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    console.error(`Error reading \${key} from localStorage:`, e);
    return fallback;
  }
};

const setItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing \${key} to localStorage:`, e);
  }
};

// --- USERS & AUTH ---
export const getUsers = () => getItem(KEYS.USERS, []);

export const saveUser = (user) => {
  const users = getUsers();
  const existingIndex = users.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
  if (existingIndex >= 0) {
    users[existingIndex] = { ...users[existingIndex], ...user };
  } else {
    users.push(user);
  }
  setItem(KEYS.USERS, users);
  return user;
};

export const getCurrentUser = () => {
  try {
    const tabUser = sessionStorage.getItem(KEYS.CURRENT_USER);
    if (tabUser) return JSON.parse(tabUser);
  } catch (e) {
    // ignore
  }
  return getItem(KEYS.CURRENT_USER, null);
};

export const setCurrentUser = (user) => {
  try {
    sessionStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
  } catch (e) {
    // ignore
  }
  setItem(KEYS.CURRENT_USER, user);
};

export const removeCurrentUser = () => {
  sessionStorage.removeItem(KEYS.CURRENT_USER);
  localStorage.removeItem(KEYS.CURRENT_USER);
};

// --- PROPERTIES ---
export const getStoredProperties = () => getItem(KEYS.PROPERTIES, []);

export const saveProperty = (property) => {
  const properties = getStoredProperties();
  const newProp = {
    ...property,
    id: property.id || Date.now(),
    createdAt: new Date().toISOString(),
  };
  properties.unshift(newProp);
  setItem(KEYS.PROPERTIES, properties);
  return newProp;
};

// --- WISHLIST ---
export const getWishlist = () => getItem(KEYS.WISHLIST, [1, 3]);

export const toggleWishlistStorage = (propertyId) => {
  const wishlist = getWishlist();
  const exists = wishlist.includes(propertyId);
  const updated = exists
    ? wishlist.filter((id) => id !== propertyId)
    : [...wishlist, propertyId];
  setItem(KEYS.WISHLIST, updated);
  return updated;
};

export const isInWishlistStorage = (propertyId) => {
  const wishlist = getWishlist();
  return wishlist.includes(propertyId);
};

// --- INQUIRIES ---
export const getInquiries = () => getItem(KEYS.INQUIRIES, [
  {
    id: 101,
    propertyId: 1,
    propertyTitle: "Modern Luxury Villa",
    userName: "Alex Morgan",
    userEmail: "alex@example.com",
    userPhone: "+91 98980 12345",
    message: "Is this villa open for negotiation on price?",
    status: "Pending",
    date: new Date().toLocaleDateString("en-IN"),
  },
  {
    id: 102,
    propertyId: 2,
    propertyTitle: "Premium 3BHK Apartment",
    userName: "Sneha Sharma",
    userEmail: "sneha@example.com",
    userPhone: "+91 98765 11223",
    message: "Would like to know the maintenance charges per month.",
    status: "Responded",
    date: new Date().toLocaleDateString("en-IN"),
  }
]);

export const addInquiry = (inquiry) => {
  const inquiries = getInquiries();
  const newInquiry = {
    ...inquiry,
    id: Date.now(),
    status: "Pending",
    date: new Date().toLocaleDateString("en-IN"),
  };
  inquiries.unshift(newInquiry);
  setItem(KEYS.INQUIRIES, inquiries);
  return newInquiry;
};

// --- APPOINTMENTS (SCHEDULE VISITS) ---
export const getAppointments = () => getItem(KEYS.APPOINTMENTS, [
  {
    id: 201,
    propertyId: 1,
    propertyTitle: "Modern Luxury Villa",
    location: "Bopal, Ahmedabad",
    date: "2026-08-25",
    time: "11:00 AM",
    userName: "Alex Morgan",
    userEmail: "alex@example.com",
    status: "Confirmed",
  }
]);

export const addAppointment = (appointment) => {
  const appointments = getAppointments();
  const newAppt = {
    ...appointment,
    id: Date.now(),
    status: "Confirmed",
    createdAt: new Date().toISOString(),
  };
  appointments.unshift(newAppt);
  setItem(KEYS.APPOINTMENTS, appointments);
  return newAppt;
};
