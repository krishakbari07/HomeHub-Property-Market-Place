import React, { useState, useEffect } from "react";
import { X, Loader2, Upload, Link as LinkIcon, MapPin, IndianRupee } from "lucide-react";

export default function AdminPropertyModal({
  isOpen = false,
  property = null,
  defaultPurpose = "buy",
  loading = false,
  onSave,
  onClose,
}) {
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    purpose: "buy",
    type: "Apartment",
    location: "",
    city: "Ahmedabad",
    bedrooms: 3,
    bathrooms: 2,
    areaSqFt: 1500,
    furnishing: "Fully Furnished",
    status: "Available",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    description: "",
  });
  const [imageMode, setImageMode] = useState("upload");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title || "",
        price: property.price || "",
        purpose: property.purpose ? property.purpose.toLowerCase() : "buy",
        type: property.type || property.propertyType || "Apartment",
        location: property.location || "",
        city: property.city || "Ahmedabad",
        bedrooms: property.bedrooms || 3,
        bathrooms: property.bathrooms || 2,
        areaSqFt: property.areaSqFt || property.area || 1500,
        furnishing: property.furnishing || "Fully Furnished",
        status: property.status || "Available",
        image: property.image || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
        description: property.description || "",
      });
    } else {
      setFormData({
        title: "",
        price: "",
        purpose: defaultPurpose,
        type: "Apartment",
        location: "",
        city: "Ahmedabad",
        bedrooms: 3,
        bathrooms: 2,
        areaSqFt: 1500,
        furnishing: "Fully Furnished",
        status: "Available",
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
        description: "Spacious luxury property with modern amenities and premium finishes.",
      });
    }
    setValidationError("");
  }, [property, defaultPurpose, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setValidationError("Image file size should be less than 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result }));
        setValidationError("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setValidationError("Property title is required.");
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setValidationError("Please enter a valid price in INR.");
      return;
    }
    if (!formData.location.trim()) {
      setValidationError("Locality / address is required.");
      return;
    }
    setValidationError("");
    onSave(formData);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-lg max-w-xl w-full p-6 shadow-xl border border-slate-200 relative my-8 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-heading font-bold text-base sm:text-lg text-[#172B3A]">
              {property ? `Edit Property: ${property.title}` : "Add New Property Listing"}
            </h3>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              {property
                ? "Update pricing, specifications, and availability status."
                : "List a new residential or commercial asset on HomeHub."}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {validationError && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {validationError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs font-sans">
          {/* Title */}
          <div>
            <label className="block text-slate-700 font-medium mb-1">
              Property Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. 3 BHK Luxury Penthouse at Bodakdev"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#315C4B] transition-colors"
            />
          </div>

          {/* Price, Purpose & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Price (₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g. 15000000"
                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#315C4B] transition-colors font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Listing Purpose</label>
              <select
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 bg-white focus:outline-none focus:border-[#315C4B] transition-colors font-medium"
              >
                <option value="buy">For Sale (Buy)</option>
                <option value="rent">For Rent (Monthly)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Availability Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 bg-white focus:outline-none focus:border-[#315C4B] transition-colors font-medium"
              >
                <option value="Available">Available</option>
                <option value="Sold">Sold</option>
                <option value="Rented">Rented</option>
              </select>
            </div>
          </div>

          {/* Type, Bedrooms, Bathrooms, Area */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Property Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 bg-white focus:outline-none focus:border-[#315C4B] transition-colors"
              >
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="House">Independent House</option>
                <option value="Plot">Plot / Land</option>
                <option value="Commercial">Commercial Office</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Bedrooms</label>
              <input
                type="number"
                min="0"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-[#315C4B] transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Bathrooms</label>
              <input
                type="number"
                min="0"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-[#315C4B] transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Area (Sq Ft)</label>
              <input
                type="number"
                min="50"
                value={formData.areaSqFt}
                onChange={(e) => setFormData({ ...formData, areaSqFt: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-[#315C4B] transition-colors"
              />
            </div>
          </div>

          {/* Location & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Locality / Area <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Bodakdev, SG Highway"
                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#315C4B] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Ahmedabad"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#315C4B] transition-colors"
              />
            </div>
          </div>

          {/* Image Selection */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-slate-700 font-medium">Property Photo</label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setImageMode("upload")}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                    imageMode === "upload"
                      ? "bg-[#315C4B] text-white"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <Upload className="w-3 h-3 inline mr-1" />
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode("url")}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                    imageMode === "url"
                      ? "bg-[#315C4B] text-white"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <LinkIcon className="w-3 h-3 inline mr-1" />
                  URL
                </button>
              </div>
            </div>

            {imageMode === "upload" ? (
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-white file:border file:border-slate-200 file:text-slate-700 hover:file:bg-slate-100 cursor-pointer"
              />
            ) : (
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#315C4B]"
              />
            )}

            {formData.image && (
              <div className="relative inline-block mt-1">
                <img
                  src={formData.image}
                  alt="Property preview"
                  className="w-24 h-16 object-cover rounded-md border border-slate-200"
                />
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                  className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full p-0.5 hover:bg-rose-700"
                  title="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-700 font-medium mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Highlight key features, floor plan, road width, amenities..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#315C4B] transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#315C4B] hover:bg-[#254538] shadow-xs flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{property ? "Update Listing" : "Add Property"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
