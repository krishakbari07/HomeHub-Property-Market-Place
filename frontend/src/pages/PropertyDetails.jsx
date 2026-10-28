import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import PropertyGallery from "../components/PropertyGallery";
import { properties } from "../data/properties";
import { useWishlist } from "../context/WishlistContext";
import {
  Heart,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Sparkles,
  CheckCircle,
  Building2
} from "lucide-react";

const PropertyDetails = () => {
  const { id } = useParams();
  const property = properties.find((p) => p.id === parseInt(id)) || properties[0];
  const { isInWishlist, toggleWishlist } = useWishlist();
  const favorited = isInWishlist(property.id);

  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryMsg, setInquiryMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleInquiry = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Header & Breadcrumb */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-xs font-semibold text-gray-500">
          <Link to="/" className="hover:text-indigo-600">Home</Link>
          <span>/</span>
          <Link to="/properties" className="hover:text-indigo-600">Properties</Link>
          <span>/</span>
          <span className="text-gray-900">{property.title}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full text-white ${property.tagColor || "bg-indigo-600"}`}>
                {property.tag}
              </span>
              <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-full flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{property.aiMatchScore}% AI Match</span>
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">{property.title}</h1>
            <div className="flex items-center text-sm text-gray-500 mt-2">
              <MapPin className="w-4 h-4 mr-1 text-indigo-600" />
              <span>{property.location}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Price</div>
              <div className="text-3xl font-extrabold text-indigo-600">{property.formattedPrice}</div>
            </div>

            <button
              onClick={() => toggleWishlist(property.id)}
              className={`p-3 rounded-2xl border transition shadow-sm ${
                favorited
                  ? "bg-rose-50 border-rose-200 text-rose-600"
                  : "bg-white border-gray-200 text-gray-600 hover:text-rose-500"
              }`}
            >
              <Heart className={`w-5 h-5 ${favorited ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Gallery & Agent Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Gallery & Details */}
        <div className="lg:col-span-8 space-y-8">
          
          <PropertyGallery images={property.galleryImages} title={property.title} />

          {/* Quick Specs Grid */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-gray-50 rounded-xl space-y-1">
              <Bed className="w-5 h-5 text-indigo-600 mx-auto" />
              <div className="text-xs text-gray-500 font-medium">Bedrooms</div>
              <div className="text-base font-bold text-gray-900">{property.bedrooms} Beds</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl space-y-1">
              <Bath className="w-5 h-5 text-indigo-600 mx-auto" />
              <div className="text-xs text-gray-500 font-medium">Bathrooms</div>
              <div className="text-base font-bold text-gray-900">{property.bathrooms} Baths</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl space-y-1">
              <Maximize2 className="w-5 h-5 text-indigo-600 mx-auto" />
              <div className="text-xs text-gray-500 font-medium">Total Area</div>
              <div className="text-base font-bold text-gray-900">{property.area} Sq.Ft</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl space-y-1">
              <Building2 className="w-5 h-5 text-indigo-600 mx-auto" />
              <div className="text-xs text-gray-500 font-medium">Property Type</div>
              <div className="text-base font-bold text-gray-900">{property.type}</div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-gray-900">About this Property</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{property.description}</p>
          </div>

          {/* Amenities */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Features & Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {property.amenities.map((amenity, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-sm text-gray-700 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Agent Card & Contact Form */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Agent Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center space-x-4">
              <img
                src={property.agent.image}
                alt={property.agent.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-indigo-100"
              />
              <div>
                <h3 className="text-lg font-bold text-gray-900">{property.agent.name}</h3>
                <p className="text-xs text-indigo-600 font-semibold">{property.agent.role}</p>
                <div className="text-xs text-gray-500 mt-1">⭐ {property.agent.rating} ({property.agent.reviews} Reviews)</div>
              </div>
            </div>

            <form onSubmit={handleInquiry} className="space-y-4">
              <h4 className="text-sm font-bold text-gray-800">Contact Agent</h4>
              <div>
                <input
                  type="text"
                  required
                  value={inquiryName}
                  onChange={(e) => setInquiryName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <input
                  type="email"
                  required
                  value={inquiryEmail}
                  onChange={(e) => setInquiryEmail(e.target.value)}
                  placeholder="Your Email"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <textarea
                  rows="3"
                  required
                  value={inquiryMsg}
                  onChange={(e) => setInquiryMsg(e.target.value)}
                  placeholder={`I'm interested in ${property.title}...`}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow transition"
              >
                Send Message
              </button>

              {submitted && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold text-center">
                  Message sent successfully! The agent will respond shortly.
                </div>
              )}
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default PropertyDetails;
