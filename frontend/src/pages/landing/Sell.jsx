import React from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Building2, ShieldCheck, Users, TrendingUp } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useProperty } from "../../context/PropertyContext";
import { useToast } from "../../context/ToastContext";
import ImageWithFallback from "../../components/common/ImageWithFallback";

const Sell = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { triggerAuthModal } = useProperty();
  const { toast } = useToast();

  const handleListProperty = () => {
    if (!isAuthenticated) {
      triggerAuthModal("Please sign in as a Seller or Agent to list your property on HomeHub.");
      return;
    }

    if (user?.role === "Seller") {
      navigate("/seller/add-property");
    } else if (user?.role === "Agent") {
      navigate("/agent/add-listing");
    } else {
      toast.info(
        "You are currently logged in with a standard Buyer account. Please register or sign in with a Seller or Agent account to publish properties."
      );
      navigate("/seller/dashboard");
    }
  };

  return (
    <div className="py-16 bg-ivory-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Natural Hero Header */}
        <div className="relative rounded-3xl overflow-hidden shadow-elevated bg-navy-950 text-white p-8 sm:p-20 text-center space-y-6 group border border-navy-800">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=95"
            fallbackSrc="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2400&q=95"
            alt="Sell Property Hero Background"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-40 group-hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-900/60 to-navy-950/40" />

          {/* Foreground Content */}
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-navy-800/80 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-gold-400 border border-navy-700 shadow-sm">
              <Building2 className="w-4 h-4 text-gold-400" />
              <span>Direct Seller & Developer Exposure</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-heading font-extrabold max-w-4xl mx-auto leading-tight tracking-tight text-white">
              List Your Premier Real Estate on HomeHub
            </h1>

            <p className="text-ivory-200 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed font-normal">
              Connect directly with high-intent buyers, institutional investors, and verified tenants. Benefit from AI matching and discreet advisory.
            </p>

            <div className="pt-4">
              <button
                onClick={handleListProperty}
                className="bg-forest-700 hover:bg-forest-800 text-white font-bold text-base px-9 py-4 rounded-xl shadow-elevated transition-all inline-flex items-center space-x-2.5"
              >
                <PlusCircle className="w-5 h-5 text-white" />
                <span>Publish Listing Now</span>
              </button>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-ivory-300 shadow-card space-y-4 text-center hover:shadow-elevated transition-all">
            <div className="w-14 h-14 mx-auto bg-forest-50 border border-forest-100 text-forest-700 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-heading font-bold text-navy-900">Maximized Market Valuation</h3>
            <p className="text-navy-600 text-sm leading-relaxed">
              Leverage historical transaction intelligence to price your property competitively and accelerate sale closings.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-ivory-300 shadow-card space-y-4 text-center hover:shadow-elevated transition-all">
            <div className="w-14 h-14 mx-auto bg-forest-50 border border-forest-100 text-forest-700 rounded-xl flex items-center justify-center">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-heading font-bold text-navy-900">Verified High-Intent Buyers</h3>
            <p className="text-navy-600 text-sm leading-relaxed">
              Every inquiry is pre-qualified, ensuring your time is spent with genuine buyers ready for transactions.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-ivory-300 shadow-card space-y-4 text-center hover:shadow-elevated transition-all">
            <div className="w-14 h-14 mx-auto bg-forest-50 border border-forest-100 text-forest-700 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-heading font-bold text-navy-900">Discreet Privacy Controls</h3>
            <p className="text-navy-600 text-sm leading-relaxed">
              Control personal contact visibility and approve viewing schedules only at times that align with your requirements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sell;
