import React from "react";
import SearchBar from "./SearchBar";
import { ShieldCheck, Award, Sparkles } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden min-h-[620px] lg:min-h-[680px] flex items-center bg-navy-950">
      {/* Background Photography with Warm Architectural Luxury */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2400&q=90"
          alt="Luxury Architecture Residence"
          className="w-full h-full object-cover object-center scale-100"
        />
        {/* Architectural Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-900/80 to-navy-950/40 md:w-3/4" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-transparent to-transparent" />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 py-16 lg:py-20">
        <div className="max-w-2xl space-y-6 text-left">
          {/* Subtle Trust Pill */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-navy-800/80 border border-gold-400/30 text-gold-400 backdrop-blur-md text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Assisted Prime & Luxury Real Estate</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-heading font-extrabold text-white tracking-tight leading-[1.12]">
            Discover Your Next <br />
            <span className="text-gold-400 font-extrabold">Exceptional</span> Residence
          </h1>

          {/* Subtitle */}
          <p className="text-navy-200 text-base sm:text-lg font-sans leading-relaxed max-w-xl">
            A curated marketplace of verified luxury villas, penthouse suites, and prime estates with intelligent AI recommendations and trusted advisory.
          </p>

          {/* Search Card Overlay */}
          <div className="pt-2">
            <SearchBar />
          </div>

          {/* Trust Indicators */}
          <div className="pt-3 flex flex-wrap items-center gap-6 text-xs font-medium text-navy-300">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-forest-400" />
              <span>100% RERA & Title Verified</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-gold-400" />
              <span>Direct Developer & Certified Agent Pricing</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
