import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-12 sm:py-16 bg-ivory-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-navy-900 text-white rounded-3xl py-12 sm:py-14 px-6 sm:px-12 text-center border border-navy-800 shadow-elevated relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-forest-900/30 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center space-x-2 bg-navy-800/80 border border-navy-700 px-4 py-1.5 rounded-full text-xs font-bold text-gold-400">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>Private Real Estate Marketplace</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-white leading-tight">
              Ready to Discover Your Next Architectural Residence?
            </h2>
            <p className="text-ivory-200 text-sm sm:text-base leading-relaxed">
              Join discerning buyers, tenants, and verified property owners on HomeHub. Access curated luxury estates and personalized property matchmaking.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-forest-700 hover:bg-forest-800 text-white font-bold px-8 py-3.5 rounded-xl shadow-subtle transition-all duration-200 text-sm"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/buy"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-navy-800 hover:bg-navy-700 text-ivory-100 font-bold px-8 py-3.5 rounded-xl border border-navy-700 transition-all duration-200 text-sm"
              >
                <span>Explore Portfolio</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
