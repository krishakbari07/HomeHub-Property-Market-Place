import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const AIRecommendationSection = () => {
  return (
    <section className="bg-ivory-50 py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-b border-ivory-300">
      <div className="max-w-5xl mx-auto text-center space-y-5">
        <div className="inline-flex items-center space-x-2 bg-forest-50 border border-forest-100 text-forest-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intelligent Property Matchmaking</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-navy-900">
          Personalized Architectural Recommendations
        </h2>
        <p className="text-navy-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Our intelligent curation engine analyzes your lifestyle preferences, spatial needs, and investment budget to recommend properties with exceptional fidelity.
        </p>
        <div className="pt-2">
          <Link
            to="/ai-recommendations"
            className="inline-flex items-center space-x-2 bg-navy-900 hover:bg-navy-800 text-white font-bold px-7 py-3 rounded-xl shadow-subtle text-sm transition-all"
          >
            <span>Launch Intelligent Match</span>
            <ArrowRight className="w-4 h-4 text-gold-400" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AIRecommendationSection;
