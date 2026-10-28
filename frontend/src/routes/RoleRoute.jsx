import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getSessionToken, getSessionUser } from "../utils/session";

const RoleRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while session verification is running on page refresh
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-3 bg-ivory-100">
        <Loader2 className="w-8 h-8 text-forest-700 animate-spin" />
        <p className="text-xs font-semibold text-navy-600">Verifying session permissions...</p>
      </div>
    );
  }

  // Check tab-isolated token and user
  const token = getSessionToken() || user?.token;
  const sessionUser = getSessionUser() || user;

  // COMPULSORY LOGIN CHECK: If not logged in, redirect directly to /login page
  if (!isAuthenticated || !sessionUser || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Parse user role
  const rawRole = (sessionUser?.role || user?.role || "").toLowerCase();

  const isTargetingAdmin = allowedRoles.some((r) => r.toLowerCase() === "admin");

  // COMPULSORY ADMIN CHECK: Admin dashboard page CANNOT open without Admin Login
  if (isTargetingAdmin && rawRole !== "admin") {
    // Non-admin attempting to access admin page -> Redirect to Login
    return <Navigate to="/login" state={{ message: "Admin login compulsory" }} replace />;
  }

  // If user is Admin, grant access
  if (rawRole === "admin") {
    return children;
  }

  const userRole = (rawRole === "rental" || rawRole === "renter") ? "buyer" : rawRole;
  const normalizedAllowed = allowedRoles.map((r) => {
    const lr = r.toLowerCase();
    return (lr === "rental" || lr === "renter") ? "buyer" : lr;
  });

  if (normalizedAllowed.length > 0 && !normalizedAllowed.includes(userRole) && !normalizedAllowed.includes(rawRole)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RoleRoute;
