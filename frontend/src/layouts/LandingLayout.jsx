import React from "react";
import MainNavbar from "../components/landing/MainNavbar";
import Footer from "../components/landing/Footer";
import LoginRequiredModal from "../components/common/LoginRequiredModal";
import AIChatbotDrawer from "../components/common/AIChatbotDrawer";

const LandingLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-ivory-100 text-navy-800 relative selection:bg-gold-100 selection:text-navy-900">
      <MainNavbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <LoginRequiredModal />
      <AIChatbotDrawer />
    </div>
  );
};

export default LandingLayout;
