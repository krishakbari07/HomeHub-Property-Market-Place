import React from "react";
import { Building2, ShieldCheck, Sparkles, Users } from "lucide-react";
import ImageWithFallback from "../../components/common/ImageWithFallback";

const About = () => {
  return (
    <div className="py-16 bg-ivory-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Architectural Hero Header */}
        <div className="relative rounded-3xl overflow-hidden shadow-card bg-navy-950 text-white p-8 sm:p-20 text-center space-y-6 group border border-navy-800">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2400&q=95"
            fallbackSrc="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=95"
            alt="About HomeHub"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-40 scale-100 group-hover:scale-102 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-900/80 to-transparent" />

          {/* Hero Content */}
          <div className="relative z-10 space-y-5 max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-navy-800/80 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-gold-400 border border-gold-400/30 shadow-subtle">
              <Building2 className="w-3.5 h-3.5 text-gold-400" />
              <span>Next-Generation Real Estate Platform</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-heading font-extrabold leading-tight tracking-tight text-white">
              Elevating Real Estate with Precision, Trust, & Intelligence
            </h1>

            <p className="text-navy-200 text-sm sm:text-base leading-relaxed font-sans font-medium">
              HomeHub bridges verified luxury properties, certified real estate advisors, and intelligent matching algorithms to create an unparalleled acquisition and leasing experience.
            </p>
          </div>
        </div>

        {/* Executive Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="bg-white p-8 rounded-2xl border border-ivory-300 shadow-subtle space-y-1">
            <span className="text-3xl sm:text-4xl font-heading font-extrabold text-navy-900">500+</span>
            <span className="block text-xs font-bold text-navy-500 uppercase tracking-wider">Verified Listings</span>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-ivory-300 shadow-subtle space-y-1">
            <span className="text-3xl sm:text-4xl font-heading font-extrabold text-forest-700">100%</span>
            <span className="block text-xs font-bold text-navy-500 uppercase tracking-wider">RERA Verified</span>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-ivory-300 shadow-subtle space-y-1">
            <span className="text-3xl sm:text-4xl font-heading font-extrabold text-gold-600">₹ 250+ Cr</span>
            <span className="block text-xs font-bold text-navy-500 uppercase tracking-wider">Portfolio Transacted</span>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-ivory-300 shadow-subtle space-y-1">
            <span className="text-3xl sm:text-4xl font-heading font-extrabold text-navy-900">12</span>
            <span className="block text-xs font-bold text-navy-500 uppercase tracking-wider">Key Metros</span>
          </div>
        </div>

        {/* Pillars / Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-ivory-300 shadow-subtle space-y-3.5">
            <div className="w-12 h-12 rounded-xl bg-ivory-100 border border-ivory-300 flex items-center justify-center text-forest-700 shadow-subtle">
              <Sparkles className="w-6 h-6 text-forest-700" />
            </div>
            <h3 className="text-lg font-heading font-bold text-navy-900">AI-Powered Valuation & Match</h3>
            <p className="text-xs text-navy-600 leading-relaxed font-sans font-medium">
              Our intelligent algorithms score and match luxury residences based on budget constraints, lifestyle amenities, and prime locality connectivity.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-ivory-300 shadow-subtle space-y-3.5">
            <div className="w-12 h-12 rounded-xl bg-ivory-100 border border-ivory-300 flex items-center justify-center text-forest-700 shadow-subtle">
              <ShieldCheck className="w-6 h-6 text-forest-700" />
            </div>
            <h3 className="text-lg font-heading font-bold text-navy-900">100% Title & RERA Verification</h3>
            <p className="text-xs text-navy-600 leading-relaxed font-sans font-medium">
              Every property title and certified advisor profile undergoes rigorous verification before publication on our marketplace.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-ivory-300 shadow-subtle space-y-3.5">
            <div className="w-12 h-12 rounded-xl bg-ivory-100 border border-ivory-300 flex items-center justify-center text-forest-700 shadow-subtle">
              <Users className="w-6 h-6 text-forest-700" />
            </div>
            <h3 className="text-lg font-heading font-bold text-navy-900">Direct Escorted Appointments</h3>
            <p className="text-xs text-navy-600 leading-relaxed font-sans font-medium">
              Seamlessly schedule escorted site visits and communicate directly with certified brokers and property developers without intermediaries.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
