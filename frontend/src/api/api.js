import axios from "axios";
import { getSessionToken, clearTabSession } from "../utils/session";

// Environment Variable baseURL fallback
const getApiBaseUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL;
  const isRemote =
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1";

  // If hosted in production on a remote domain (e.g. Vercel), ensure requests target Render backend
  if (isRemote) {
    if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1") && envUrl !== "/api") {
      return envUrl;
    }
    return "https://homehub-property-market-place.onrender.com/api";
  }

  // Local development
  if (envUrl) {
    return envUrl;
  }
  return "http://127.0.0.1:5000/api";
};

export const API_BASE_URL = getApiBaseUrl();

// Create centralized Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request Interceptor: Attach tab-scoped JWT token automatically to header
api.interceptors.request.use(
  (config) => {
    const token = getSessionToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 Unauthorized for THIS tab only
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("401 Unauthorized response received. Clearing tab auth state.");
      clearTabSession();

      // Notify window of unauth session if on client side
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.dispatchEvent(new CustomEvent("homehub_unauthorized"));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
