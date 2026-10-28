import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

// Layouts
import LandingLayout from "../layouts/LandingLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import RoleRoute from "./RoleRoute";
import VisitorTracker from "../components/common/VisitorTracker";

// Eagerly Loaded Public Core Pages
import Home from "../pages/landing/Home";
import Buy from "../pages/landing/Buy";
import Rent from "../pages/landing/Rent";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// Lazy-Loaded Secondary Public & Auth Pages
const About = lazy(() => import("../pages/landing/About"));
const Contact = lazy(() => import("../pages/landing/Contact"));
const Sell = lazy(() => import("../pages/landing/Sell"));
const Agents = lazy(() => import("../pages/landing/Agents"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));
const PropertyDetails = lazy(() => import("../pages/property/PropertyDetails"));
const AIRecommendations = lazy(() => import("../pages/property/AIRecommendations"));

// Lazy-Loaded Buyer Dashboard Pages
const BuyerDashboard = lazy(() => import("../pages/dashboard/buyer/BuyerDashboard"));
const MyOffers = lazy(() => import("../pages/dashboard/buyer/MyOffers"));
const Wishlist = lazy(() => import("../pages/dashboard/buyer/Wishlist"));
const MyInquiries = lazy(() => import("../pages/dashboard/buyer/MyInquiries"));
const ScheduledVisits = lazy(() => import("../pages/dashboard/buyer/ScheduledVisits"));
const BuyerProfile = lazy(() => import("../pages/dashboard/buyer/BuyerProfile"));

// Lazy-Loaded Seller Dashboard Pages
const SellerDashboard = lazy(() => import("../pages/dashboard/seller/SellerDashboard"));
const AddProperty = lazy(() => import("../pages/dashboard/seller/AddProperty"));
const EditProperty = lazy(() => import("../pages/dashboard/seller/EditProperty"));
const MyProperties = lazy(() => import("../pages/dashboard/seller/MyProperties"));
const PropertyInquiries = lazy(() => import("../pages/dashboard/seller/PropertyInquiries"));
const Offers = lazy(() => import("../pages/dashboard/seller/Offers"));
const SellerAnalytics = lazy(() => import("../pages/dashboard/seller/Analytics"));
const SellerProfile = lazy(() => import("../pages/dashboard/seller/SellerProfile"));

// Lazy-Loaded Agent Dashboard Pages
const AgentDashboard = lazy(() => import("../pages/dashboard/agent/AgentDashboard"));
const MyListings = lazy(() => import("../pages/dashboard/agent/MyListings"));
const AgentOffers = lazy(() => import("../pages/dashboard/agent/AgentOffers"));
const Clients = lazy(() => import("../pages/dashboard/agent/Clients"));
const Appointments = lazy(() => import("../pages/dashboard/agent/Appointments"));
const AgentAnalytics = lazy(() => import("../pages/dashboard/agent/Analytics"));
const AgentProfile = lazy(() => import("../pages/dashboard/agent/AgentProfile"));

// Lazy-Loaded Admin Dashboard Page
const AdminDashboard = lazy(() => import("../pages/dashboard/admin/AdminDashboard"));

// Lightweight loading fallback for lazy-loaded route chunks
const PageFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3 bg-[#F7F5F0]">
    <Loader2 className="w-8 h-8 text-[#315C4B] animate-spin" />
    <span className="text-xs font-semibold text-[#596873]">Loading page...</span>
  </div>
);

// Redirect generic /dashboard based on user role
const GeneralDashboardRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  const role = user.role?.toLowerCase();
  switch (role) {
    case "admin":
      return <Navigate to="/admin/dashboard" replace />;
    case "seller":
      return <Navigate to="/seller/dashboard" replace />;
    case "agent":
      return <Navigate to="/agent/dashboard" replace />;
    case "buyer":
    case "rental":
    case "renter":
    default:
      return <Navigate to="/buyer/dashboard" replace />;
  }
};

const AppRoutes = () => {
  return (
    <>
      <VisitorTracker />
      <Suspense fallback={<PageFallback />}>
        <Routes>
        {/* PUBLIC LANDING ROUTES */}
      <Route path="/" element={<LandingLayout><Home /></LandingLayout>} />
      <Route path="/home" element={<LandingLayout><Home /></LandingLayout>} />
      <Route path="/about" element={<LandingLayout><About /></LandingLayout>} />
      <Route path="/about-us" element={<LandingLayout><About /></LandingLayout>} />
      <Route path="/contact" element={<LandingLayout><Contact /></LandingLayout>} />

      {/* AUTH ROUTES */}
      <Route path="/login" element={<LandingLayout><Login /></LandingLayout>} />
      <Route path="/register" element={<LandingLayout><Register /></LandingLayout>} />
      <Route path="/forgot-password" element={<LandingLayout><ForgotPassword /></LandingLayout>} />
      <Route path="/reset-password" element={<LandingLayout><ResetPassword /></LandingLayout>} />

      {/* PUBLIC FEATURE ROUTES */}
      <Route path="/buy" element={<LandingLayout><Buy /></LandingLayout>} />
      <Route path="/rent" element={<LandingLayout><Rent /></LandingLayout>} />
      <Route path="/sell" element={<LandingLayout><Sell /></LandingLayout>} />
      <Route path="/agents" element={<LandingLayout><Agents /></LandingLayout>} />
      <Route path="/properties" element={<LandingLayout><Buy /></LandingLayout>} />
      <Route path="/property/:id" element={<LandingLayout><PropertyDetails /></LandingLayout>} />
      <Route path="/ai-recommendations" element={<LandingLayout><AIRecommendations /></LandingLayout>} />
      <Route path="/ai-recommendation" element={<LandingLayout><AIRecommendations /></LandingLayout>} />

      {/* GENERAL DASHBOARD ROUTE */}
      <Route path="/dashboard" element={<GeneralDashboardRedirect />} />

      {/* ADMIN DASHBOARD ROUTES (Compulsory Admin Login Protected) */}
      <Route
        path="/admin"
        element={<RoleRoute allowedRoles={["admin"]}><AdminDashboard view="dashboard" /></RoleRoute>}
      />
      <Route
        path="/admin/dashboard"
        element={<RoleRoute allowedRoles={["admin"]}><AdminDashboard view="dashboard" /></RoleRoute>}
      />
      <Route
        path="/dashboard/admin"
        element={<RoleRoute allowedRoles={["admin"]}><AdminDashboard view="dashboard" /></RoleRoute>}
      />
      <Route
        path="/admin/users"
        element={<RoleRoute allowedRoles={["admin"]}><AdminDashboard view="users" /></RoleRoute>}
      />
      <Route
        path="/admin/properties"
        element={<RoleRoute allowedRoles={["admin"]}><AdminDashboard view="properties" /></RoleRoute>}
      />
      <Route
        path="/admin/add-property"
        element={<RoleRoute allowedRoles={["admin"]}><AdminDashboard view="properties" initialAddProperty={true} /></RoleRoute>}
      />
      <Route
        path="/admin/appointments"
        element={<RoleRoute allowedRoles={["admin"]}><AdminDashboard view="appointments" /></RoleRoute>}
      />
      <Route
        path="/admin/inquiries"
        element={<RoleRoute allowedRoles={["admin"]}><AdminDashboard view="inquiries" /></RoleRoute>}
      />
      <Route
        path="/admin/offers"
        element={<RoleRoute allowedRoles={["admin"]}><AdminDashboard view="offers" /></RoleRoute>}
      />
      <Route
        path="/admin/analytics"
        element={<RoleRoute allowedRoles={["admin"]}><AdminDashboard view="analytics" /></RoleRoute>}
      />
      <Route
        path="/admin/visitors"
        element={<RoleRoute allowedRoles={["admin"]}><AdminDashboard view="analytics" /></RoleRoute>}
      />
      <Route
        path="/admin/settings"
        element={<RoleRoute allowedRoles={["admin"]}><AdminDashboard view="settings" /></RoleRoute>}
      />

      {/* BUYER DASHBOARD ROUTES */}
      <Route
        path="/buyer/dashboard"
        element={<RoleRoute allowedRoles={["buyer", "rental"]}><DashboardLayout role="buyer"><BuyerDashboard /></DashboardLayout></RoleRoute>}
      />
      <Route
        path="/dashboard/buyer"
        element={<RoleRoute allowedRoles={["buyer", "rental"]}><DashboardLayout role="buyer"><BuyerDashboard /></DashboardLayout></RoleRoute>}
      />
      <Route
        path="/buyer/offers"
        element={<RoleRoute allowedRoles={["buyer", "rental"]}><DashboardLayout role="buyer"><MyOffers /></DashboardLayout></RoleRoute>}
      />
      <Route
        path="/buyer/wishlist"
        element={<RoleRoute allowedRoles={["buyer", "rental"]}><DashboardLayout role="buyer"><Wishlist /></DashboardLayout></RoleRoute>}
      />
      <Route
        path="/wishlist"
        element={<RoleRoute allowedRoles={["buyer", "rental"]}><DashboardLayout role="buyer"><Wishlist /></DashboardLayout></RoleRoute>}
      />
      <Route
        path="/buyer/inquiries"
        element={<RoleRoute allowedRoles={["buyer", "rental"]}><DashboardLayout role="buyer"><MyInquiries /></DashboardLayout></RoleRoute>}
      />
      <Route
        path="/buyer/visits"
        element={<RoleRoute allowedRoles={["buyer", "rental"]}><DashboardLayout role="buyer"><ScheduledVisits /></DashboardLayout></RoleRoute>}
      />
      <Route
        path="/buyer/profile"
        element={<RoleRoute allowedRoles={["buyer", "rental"]}><DashboardLayout role="buyer"><BuyerProfile /></DashboardLayout></RoleRoute>}
      />

      {/* SELLER DASHBOARD ROUTES */}
      <Route
        path="/seller/dashboard"
        element={<RoleRoute allowedRoles={["seller"]}><DashboardLayout role="seller"><SellerDashboard /></DashboardLayout></RoleRoute>}
      />
      <Route
        path="/dashboard/seller"
        element={<RoleRoute allowedRoles={["seller"]}><DashboardLayout role="seller"><SellerDashboard /></DashboardLayout></RoleRoute>}
      />
      <Route
        path="/seller/add-property"
        element={<RoleRoute allowedRoles={["seller"]}><DashboardLayout role="seller"><AddProperty /></DashboardLayout></RoleRoute>}
      />
      <Route
        path="/dashboard/seller/add-property"
        element={<RoleRoute allowedRoles={["seller"]}><DashboardLayout role="seller"><AddProperty /></DashboardLayout></RoleRoute>}
      />
      <Route
        path="/seller/edit-property/:id"
        element={<RoleRoute allowedRoles={["seller"]}><DashboardLayout role="seller"><EditProperty /></DashboardLayout></RoleRoute>}
      />
      <Route
        path="/seller/properties"
        element={<RoleRoute allowedRoles={["seller"]}><DashboardLayout role="seller"><MyProperties /></DashboardLayout></RoleRoute>}
      />
      <Route
        path="/seller/inquiries"
        element={<RoleRoute allowedRoles={["seller"]}><DashboardLayout role="seller"><PropertyInquiries /></DashboardLayout></RoleRoute>}
      />
      <Route
        path="/seller/offers"
        element={<RoleRoute allowedRoles={["seller"]}><DashboardLayout role="seller"><Offers /></DashboardLayout></RoleRoute>}
      />
      <Route
        path="/seller/analytics"
        element={<RoleRoute allowedRoles={["seller"]}><DashboardLayout role="seller"><SellerAnalytics /></DashboardLayout></RoleRoute>}
      />
      <Route
        path="/seller/profile"
        element={<RoleRoute allowedRoles={["seller"]}><DashboardLayout role="seller"><SellerProfile /></DashboardLayout></RoleRoute>}
      />

      {/* AGENT DASHBOARD ROUTES */}
      <Route
        path="/agent/dashboard"
        element={<RoleRoute allowedRoles={["agent"]}><DashboardLayout role="agent"><AgentDashboard /></DashboardLayout></RoleRoute>}
      />
      <Route
        path="/dashboard/agent"
        element={<RoleRoute allowedRoles={["agent"]}><DashboardLayout role="agent"><AgentDashboard /></DashboardLayout></RoleRoute>}
      />
      <Route
        path="/agent/add-listing"
        element={<RoleRoute allowedRoles={["agent"]}><DashboardLayout role="agent"><AddProperty /></DashboardLayout></RoleRoute>}
      />
      <Route
        path="/agent/edit-property/:id"
        element={<RoleRoute allowedRoles={["agent"]}><DashboardLayout role="agent"><EditProperty /></DashboardLayout></RoleRoute>}
      />
      <Route
        path="/agent/listings"
        element={<RoleRoute allowedRoles={["agent"]}><DashboardLayout role="agent"><MyListings /></DashboardLayout></RoleRoute>}
      />
      <Route
        path="/agent/offers"
        element={<RoleRoute allowedRoles={["agent"]}><DashboardLayout role="agent"><AgentOffers /></DashboardLayout></RoleRoute>}
      />
      <Route
        path="/agent/clients"
        element={<RoleRoute allowedRoles={["agent"]}><DashboardLayout role="agent"><Clients /></DashboardLayout></RoleRoute>}
      />
      <Route
        path="/agent/appointments"
        element={<RoleRoute allowedRoles={["agent"]}><DashboardLayout role="agent"><Appointments /></DashboardLayout></RoleRoute>}
      />
      <Route
        path="/agent/analytics"
        element={<RoleRoute allowedRoles={["agent"]}><DashboardLayout role="agent"><AgentAnalytics /></DashboardLayout></RoleRoute>}
      />
      <Route
        path="/agent/profile"
        element={<RoleRoute allowedRoles={["agent"]}><DashboardLayout role="agent"><AgentProfile /></DashboardLayout></RoleRoute>}
      />

      {/* FALLBACK */}
      <Route path="*" element={<LandingLayout><Home /></LandingLayout>} />
    </Routes>
    </Suspense>
    </>
  );
};

export default AppRoutes;
