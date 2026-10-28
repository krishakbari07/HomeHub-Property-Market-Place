import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi, userApi } from "../services/api";
import {
  getSessionToken,
  getSessionUser,
  setSessionAuth,
  updateSessionUser,
  clearTabSession,
} from "../utils/session";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getSessionUser());
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user && !!(user.token || getSessionToken());

  // Check and sync logged-in profile on mount for this specific tab
  useEffect(() => {
    const token = getSessionToken() || user?.token;
    if (token) {
      authApi
        .getProfile()
        .then((res) => {
          const profileData = res.data || res;
          if (profileData && (profileData._id || profileData.id)) {
            const updatedUser = {
              ...user,
              ...profileData,
              token: token,
            };
            setUser(updatedUser);
            setSessionAuth(token, updatedUser, false);
          }
        })
        .catch((err) => {
          console.warn("Session check failed or expired for tab:", err.message);
          if (err.response && err.response.status === 401) {
            logout();
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener("homehub_unauthorized", handleUnauthorized);
    return () => window.removeEventListener("homehub_unauthorized", handleUnauthorized);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Register function: Creates account in MongoDB Atlas, does NOT log user in automatically
  const register = async ({ name, email, phone, password, role }) => {
    try {
      const res = await authApi.register({ name, email, phone, password, role });
      const responseData = res.data || res;
      console.log("✅ New user registered in MongoDB Atlas:", responseData.email);
      return responseData;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Registration failed";
      console.error("Register API error:", msg);
      throw new Error(msg);
    }
  };

  // Login function calling Express API -> MongoDB Atlas -> Generates JWT & tab-scoped session
  const login = async (email, password) => {
    try {
      const res = await authApi.login(email, password);
      const responseData = res.data || res;
      const token = responseData.token || res.token;

      const loggedUser = {
        _id: responseData._id || responseData.id,
        id: responseData._id || responseData.id,
        name: responseData.name,
        email: responseData.email,
        role: responseData.role,
        phone: responseData.phone,
        avatar: responseData.avatar,
        preferredCity: responseData.preferredCity,
        budgetRange: responseData.budgetRange,
        agencyName: responseData.agencyName,
        token: token,
      };

      setSessionAuth(token, loggedUser, true);
      setUser(loggedUser);
      console.log("✅ User authenticated via JWT in tab:", loggedUser.email, `(${loggedUser.role})`);
      return loggedUser;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Invalid credentials";
      console.error("Login API error:", msg);
      throw new Error(msg);
    }
  };

  // Update User Profile in state, tab session, and MongoDB Atlas API
  const updateProfile = async (updatedFields) => {
    try {
      const updatedUser = updateSessionUser(updatedFields);
      setUser(updatedUser);

      try {
        const res = await userApi.updateMe(updatedFields);
        const serverUser = res.data || res.user || res;
        if (serverUser && (serverUser._id || serverUser.id)) {
          const finalUser = updateSessionUser(serverUser);
          setUser(finalUser);
        }
      } catch (e) {
        console.warn("Backend update failed, profile updated in tab storage:", e.message);
      }
      return updatedUser;
    } catch (err) {
      console.error("Failed to update profile:", err);
      throw err;
    }
  };

  // Logout current tab
  const logout = () => {
    clearTabSession();
    setUser(null);
    console.log("User logged out from tab");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
