import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { visitorApi } from "../../services/api";

const VisitorTracker = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // Only track if page changed or user changed
    const trackPageVisit = async () => {
      try {
        const path = location.pathname;
        const pageTitle = document.title || "HomeHub Real Estate";

        await visitorApi.logVisit({
          isLoggedIn: Boolean(user),
          userName: user?.name || "Guest Visitor (Not Logged In)",
          userEmail: user?.email || "Anonymous Visitor",
          userRole: user?.role || "Guest",
          pageVisited: path,
          pageTitle,
          device: navigator.userAgent,
        });
      } catch (err) {
        // silent catch
      }
    };

    trackPageVisit();
  }, [location.pathname, user]);

  return null; // Silent tracker
};

export default VisitorTracker;
