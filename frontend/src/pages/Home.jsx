import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Bot,
  ShieldCheck,
  Zap,
  Headphones,
  ChevronRight
} from "lucide-react";
import SearchBar from "../components/SearchBar";
import PropertyCard from "../components/PropertyCard";
import { properties } from "../data/properties";

const Home = () => {
  return (
    <div className="space-y-20 pb-16 bg-slate-50/40">
      
      {/* HERO SECTION WITH FULL BACKGROUND IMAGE */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28 bg-slate-900 border-b border-gray-100 min-h-[580px] flex flex-col justify-center">
        
        {/* Full width background image with subtle gradient overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80"
            alt="Hero Modern Villa Background"
            className="w-full h-full object-cover object-center lg:object-right-top"
          />
          {/* Light gradient overlay on left for sharp text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent lg:w-3/5" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent h-28 bottom-0" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
          
          {/* Hero Content Left */}
          <div className="max-w-2xl space-y-5 text-left">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-indigo-100 text-indigo-700 font-semibold text-xs tracking-wide shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI Powered Property Marketplace</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.12]">
              Find Your Dream Property{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                with AI
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-gray-700 text-base sm:text-lg max-w-lg leading-relaxed font-medium">
              Smart recommendations. Trusted listings. Seamless experience.
            </p>

          </div>

          {/* Floating Search Bar Component */}
          <div className="pt-2 max-w-4xl">
            <SearchBar activeMode="buy" />
          </div>

        </div>
      </section>


      {/* FEATURED PROPERTIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">
              FEATURED PROPERTIES
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Handpicked Properties For You
            </h2>
          </div>
          
          <Link
            to="/properties"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-white border border-gray-200 hover:border-indigo-200 text-gray-700 hover:text-indigo-600 font-bold text-xs rounded-xl shadow-sm transition"
          >
            <span>View All Properties</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section>


      {/* WHY CHOOSE US */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
            WHY CHOOSE US
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            A Smarter Way to Find Property
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "AI Powered Search",
              desc: "Get smart property recommendations based on your preferences.",
              icon: Bot
            },
            {
              title: "Verified Listings",
              desc: "All properties are verified for your safety and peace of mind.",
              icon: ShieldCheck
            },
            {
              title: "Fast & Easy",
              desc: "Save time with smart filters and a seamless property search experience.",
              icon: Zap
            },
            {
              title: "Expert Support",
              desc: "Our team is here to help you at every step of your property journey.",
              icon: Headphones
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center space-y-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>


      {/* READY TO FIND YOUR DREAM HOME? CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between min-h-[280px]">
          
          {/* Left Text & Action */}
          <div className="space-y-4 max-w-xl text-center lg:text-left z-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Find Your Dream Home?
            </h2>
            <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
              Join thousands of happy customers who found their perfect property with us.
            </p>
            
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/properties"
                className="px-6 py-3 bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition"
              >
                Explore Properties
              </Link>
              <Link
                to="/sell"
                className="px-6 py-3 border-2 border-indigo-300 hover:border-white text-white font-bold text-sm rounded-xl transition"
              >
                List Your Property
              </Link>
            </div>
          </div>

          {/* Right Image Graphic Cutout */}
          <div className="mt-6 lg:mt-0 lg:absolute lg:bottom-0 lg:right-0 lg:w-[460px] w-full aspect-[16/10] z-10">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80"
              alt="Dream Property Cutout"
              className="w-full h-full object-cover rounded-2xl lg:rounded-tl-3xl lg:rounded-r-none shadow-2xl"
            />
          </div>

        </div>
      </section>

    </div>
  );
};

export default Home;
