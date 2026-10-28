import React from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  ShieldCheck,
  Sparkles,
  Users,
  Award,
  Target,
  HeartHandshake,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

const AboutUs = () => {
  return (
    <div className="space-y-16 pb-16 bg-slate-50/50">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-20 lg:py-24">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=2000&q=80"
            alt="HomeHub Office Background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-semibold text-xs tracking-wide">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Redefining Real Estate Experience</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight max-w-3xl mx-auto leading-tight">
            About <span className="text-indigo-400">HomeHub</span>
          </h1>
          <p className="text-gray-300 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed">
            HomeHub is India's premier AI-powered property marketplace, connecting home buyers, tenants, sellers, and certified agents with transparency and trust.
          </p>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Properties Listed", val: "10,000+", icon: Building2 },
            { label: "Happy Customers", val: "50,000+", icon: Users },
            { label: "Certified Agents", val: "1,200+", icon: Award },
            { label: "RERA Verified Ratio", val: "100%", icon: ShieldCheck }
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm text-center space-y-3 hover:shadow-md transition"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-2xl sm:text-4xl font-black text-gray-900">{stat.val}</div>
                <div className="text-xs sm:text-sm font-medium text-gray-500">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Our Mission & Vision */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
              <Target className="w-3.5 h-3.5" />
              <span>OUR PURPOSE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-snug">
              Making Property Buying & Renting Effortless
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              We started HomeHub with a single mission: to eliminate real-estate friction, fake property listings, and hidden agent fees. By leveraging advanced artificial intelligence and strict RERA verification standards, we empower families and investors to find properties with confidence.
            </p>
            <div className="space-y-3 pt-2">
              {[
                "AI Recommendations matched to your budget & lifestyle",
                "100% Verified ownership & property documentation",
                "Direct connection with certified top real estate agents",
                "End-to-end support from viewing to deal closure"
              ].map((item, idx) => (
                <div key={idx} className="flex items-start space-x-3 text-sm text-gray-700 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80"
              alt="HomeHub Experience"
              className="rounded-3xl shadow-xl object-cover w-full h-[400px]"
            />
            <div className="absolute -bottom-6 -left-6 bg-indigo-600 text-white p-6 rounded-2xl shadow-xl hidden sm:block max-w-xs space-y-1">
              <div className="text-2xl font-bold">AI Powered</div>
              <p className="text-xs text-indigo-100">Smart matching engine for buyers and tenants.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
            CORE VALUES
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Why HomeHub is Trusted Nationwide
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Transparency First",
              desc: "No hidden charges or inflated prices. Every listing contains verified price estimates and transparent specifications.",
              icon: ShieldCheck
            },
            {
              title: "Customer Centricity",
              desc: "Whether you are looking to buy a budget apartment or list a luxury villa, our platform serves your exact needs.",
              icon: HeartHandshake
            },
            {
              title: "Innovation & AI",
              desc: "Our machine learning recommendation model connects you with properties that match your aesthetic preferences and location priorities.",
              icon: Sparkles
            }
          ].map((val, idx) => {
            const Icon = val.icon;
            return (
              <div
                key={idx}
                className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4 hover:border-indigo-200 transition"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{val.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{val.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Explore HomeHub?
          </h2>
          <p className="text-indigo-100 text-sm sm:text-base max-w-xl mx-auto">
            Join thousands of homeowners, buyers, and tenants using HomeHub every day.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              to="/buy"
              className="px-6 py-3 bg-white text-indigo-700 font-bold text-sm rounded-xl shadow hover:bg-indigo-50 transition flex items-center space-x-2"
            >
              <span>Explore Buy Properties</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 bg-indigo-800 hover:bg-indigo-900 text-white font-bold text-sm rounded-xl transition"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
