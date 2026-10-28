import React from "react";
import { Link } from "react-router-dom";
import { MapPin, ArrowRight } from "lucide-react";
import { popularLocations } from "../../data/locations";
import ImageWithFallback from "../common/ImageWithFallback";

const PopularLocations = () => {
  return (
    <section className="py-16 sm:py-20 bg-ivory-100 border-t border-ivory-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-bold text-forest-700 uppercase tracking-widest">
              Curated Destinations
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-navy-900 mt-1">
              Explore Popular Locations
            </h2>
            <p className="text-navy-600 mt-2 text-base">
              Find verified residential and commercial properties in Gujarat's premier real estate hubs.
            </p>
          </div>
          <Link
            to="/buy"
            className="mt-4 md:mt-0 inline-flex items-center text-sm font-bold text-forest-700 hover:text-forest-800 space-x-1"
          >
            <span>View All Cities</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {popularLocations.map((loc) => (
            <Link
              key={loc.id}
              to={`/buy?location=${encodeURIComponent(loc.city)}`}
              className="group relative rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 aspect-[4/5] bg-navy-900 border border-ivory-300"
            >
              <ImageWithFallback
                src={loc.image}
                alt={loc.city}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/95 via-navy-900/40 to-transparent p-6 flex flex-col justify-end text-white">
                <div className="flex items-center space-x-1 text-xs text-gold-400 font-semibold mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{loc.state}</span>
                </div>
                <h3 className="text-xl font-heading font-extrabold group-hover:text-gold-300 transition-colors">
                  {loc.city}
                </h3>
                <p className="text-xs text-ivory-300 font-medium mt-1">
                  {loc.propertiesCount}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularLocations;
