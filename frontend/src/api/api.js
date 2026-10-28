import axios from "axios";
import { getSessionToken, clearTabSession } from "../utils/session";

// Environment Variable baseURL fallback
const getApiBaseUrl = () => {
  if (typeof process !== "undefined" && process?.env?.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  // If hosted in production on a remote domain/hosting without env var set, prefer relative /api over localhost
  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return "/api";
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
