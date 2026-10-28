import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload,
  Link as LinkIcon,
  X,
  Sparkles,
  Check,
} from "lucide-react";
import { useProperty } from "../../../context/PropertyContext";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { userApi, aiApi } from "../../../services/api";
import useFormValidation from "../../../hooks/useFormValidation";

const ADD_PROPERTY_SCHEMA = {
  title: {
    label: "Property Title",
    required: true,
    minLength: 5,
  },
  price: {
    label: "Price",
    required: true,
    number: true,
    min: 1,
  },
  location: {
    label: "Locality / Address",
    required: true,
    minLength: 3,
  },
  bedrooms: {
    label: "Bedrooms",
    number: true,
    min: 0,
  },
  bathrooms: {
    label: "Bathrooms",
    number: true,
    min: 0,
  },
  area: {
    label: "Area",
    number: true,
    min: 10,
  },
  imageUrl: {
    label: "Image URL",
    url: true,
  },
};

const AddProperty = () => {
  const navigate = useNavigate();
  const { addProperty } = useProperty();
  const { user } = useAuth();
  const { toast } = useToast();

  const [agentsList, setAgentsList] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [imageMode, setImageMode] = useState("upload"); // "upload" or "url"

  // AI Listing Description Generator State
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiGeneratedData, setAiGeneratedData] = useState(null);
  const [selectedTitleIndex, setSelectedTitleIndex] = useState(0);
  const [aiError, setAiError] = useState("");

  const handleGenerateAiContent = async () => {
    setAiError("");
    setAiGenerating(true);
    try {
      const res = await aiApi.generateDescription({
        propertyType: values.type || "Apartment",
        location: values.location || values.city || "Ahmedabad",
        city: values.city || "Ahmedabad",
        bedrooms: Number(values.bedrooms) || 3,
        bathrooms: Number(values.bathrooms) || 2,
        areaSqFt: Number(values.area) || 1600,
        price: Number(values.price) || 10000000,
        purpose: values.purpose || "buy",
        features: [values.furnishing].filter(Boolean),
      });

      if (res?.data) {
        setAiGeneratedData(res.data);
        setSelectedTitleIndex(0);
        setAiModalOpen(true);
      } else {
        setAiError("Could not generate AI listing content. Please ensure basic specs are filled.");
      }
    } catch (err) {
      console.error("AI Generation error:", err);
      setAiError(err.response?.data?.message || err.message || "AI generation failed. Please try again.");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleApplyAiContent = () => {
    if (!aiGeneratedData) return;
    const selectedTitle = aiGeneratedData.titles?.[selectedTitleIndex] || values.title;
    const fullDescription = [
      aiGeneratedData.description,
      aiGeneratedData.keyHighlights?.length ? `\n\nKey Highlights:\n• ${aiGeneratedData.keyHighlights.join("\n• ")}` : "",
    ].filter(Boolean).join("");

    setFieldValue("title", selectedTitle);
    setFieldValue("description", fullDescription);
    setAiModalOpen(false);
  };

  const {
    values,
    setFieldValue,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useFormValidation(

    {
      title: "",
      description: "",
      type: "Apartment",
      purpose: "buy",
      price: "",
      location: "",
      city: "Ahmedabad",
      bedrooms: "3",
      bathrooms: "2",
      area: "1500",
      furnishing: "Fully Furnished",
      imageUrl: "",
    },
    ADD_PROPERTY_SCHEMA
  );

  useEffect(() => {
    userApi
      .getAgents()
      .then((data) => {
        const rawList = Array.isArray(data) ? data : (data?.data || []);
        const unique = Array.from(new Map(rawList.map((a) => [String(a._id || a.id), a])).values());
        setAgentsList(unique);
      })
      .catch((err) => console.warn("Failed to fetch agents list:", err));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.warning("Image file size should be less than 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFieldValue("imageUrl", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (formValues) => {

    setServerError("");

    const numPrice = Number(formValues.price);
    const newPropertyObj = {
      title: formValues.title,
      description: formValues.description || "Spacious, premium property situated in prime location.",
      type: formValues.type,
      propertyType: formValues.type,
      purpose: formValues.purpose,
      listingType: formValues.purpose,
      price: numPrice,
      location: `${formValues.location}, ${formValues.city}`,
      city: formValues.city,
      state: "Gujarat",
      bedrooms: Number(formValues.bedrooms),
      bathrooms: Number(formValues.bathrooms),
      area: Number(formValues.area),
      areaSqFt: Number(formValues.area),
      furnishing: formValues.furnishing,
      image: formValues.imageUrl || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      tag: formValues.purpose === "rent" ? "For Rent" : "For Sale",
      badgeText: "New Listing",
      agent: selectedAgentId || undefined,
    };

    try {
      await addProperty(newPropertyObj);
      setSuccess(true);

      setTimeout(() => {
        const role = user?.role?.toLowerCase();
        if (role === "admin") {
          navigate("/admin/dashboard");
        } else if (role === "agent") {
          navigate("/agent/listings");
        } else {
          navigate("/seller/dashboard");
        }
      }, 1500);
    } catch (err) {
      setServerError(err.message || "Failed to create property listing.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 border border-ivory-300 shadow-subtle flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-navy-900 tracking-tight">
            Publish Property Listing
          </h1>
          <p className="text-navy-500 text-xs sm:text-sm font-sans">
            Add a new verified luxury residence to the HomeHub marketplace.
          </p>
        </div>
        <div className="w-12 h-12 bg-ivory-100 text-forest-700 border border-ivory-300 rounded-2xl flex items-center justify-center font-bold shadow-subtle">
          <PlusCircle className="w-6 h-6 text-forest-700" />
        </div>
      </div>

      {/* Notifications */}
      {serverError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center space-x-3 text-sm font-semibold">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-forest-50 border border-forest-200 text-forest-800 rounded-2xl flex items-center space-x-3 font-semibold text-sm">
          <CheckCircle2 className="w-5 h-5 text-forest-600 shrink-0" />
          <span>Property published successfully! Redirecting...</span>
        </div>
      )}

      {/* AI Generator Banner */}
      <div className="bg-[#172B3A] text-white p-5 rounded-2xl border border-[#243E53] shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#D5AD72]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#D5AD72]">
              Gemini AI Listing Copywriter
            </h2>
          </div>
          <p className="text-xs text-gray-300 font-sans max-w-lg leading-relaxed">
            Auto-generate high-conversion architectural titles, storytelling property descriptions, and key highlights tailored to your property specs.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerateAiContent}
          disabled={aiGenerating}
          className="bg-[#315C4B] hover:bg-[#254639] disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm border border-forest-600 flex items-center space-x-2 shrink-0 active:scale-95"
        >
          {aiGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#D5AD72]" />
              <span>Generating Copy...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-[#D5AD72]" />
              <span>Generate Title & Description</span>
            </>
          )}
        </button>
      </div>

      {aiError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center space-x-2.5 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{aiError}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl p-8 border border-ivory-300 shadow-subtle space-y-6" noValidate>
        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1">Property Title *</label>
          <input
            type="text"
            name="title"
            value={values.title}
            onChange={(e) => {
              setServerError("");
              handleChange(e);
            }}
            onBlur={handleBlur}
            placeholder="e.g. Luxury 3 BHK High-Rise Apartment"
            className={`w-full border p-3 rounded-xl text-sm font-semibold transition-colors ${
              touched.title && errors.title
                ? "border-rose-400 ring-2 ring-rose-100 bg-rose-50/20"
                : "border-gray-200 focus:border-indigo-500"
            }`}
          />
          {touched.title && errors.title && (
            <p className="mt-1 text-xs font-semibold text-rose-500 flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.title}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Listing Purpose</label>
            <select
              name="purpose"
              value={values.purpose}
              onChange={handleChange}
              className="w-full border p-3 rounded-xl text-sm font-semibold border-gray-200"
            >
              <option value="buy">For Sale (Buy)</option>
              <option value="rent">For Rent</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Property Type</label>
            <select
              name="type"
              value={values.type}
              onChange={handleChange}
              className="w-full border p-3 rounded-xl text-sm font-semibold border-gray-200"
            >
              <option value="Apartment">Apartment</option>
              <option value="Villa">Villa</option>
              <option value="Flat">Flat</option>
              <option value="Penthouse">Penthouse</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-gray-700 block mb-1">Assign Agent (Role: Agent)</label>
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="w-full border p-3 rounded-xl text-sm font-semibold text-gray-800 border-gray-200"
            >
              <option value="">Auto-assign or Select Agent</option>
              {agentsList.map((ag) => (
                <option key={ag._id || ag.id} value={ag._id || ag.id}>
                  {ag.name} ({ag.email}) {ag.agencyName ? `- ${ag.agencyName}` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Price (₹) *</label>
            <input
              type="number"
              name="price"
              value={values.price}
              onChange={(e) => {
                setServerError("");
                handleChange(e);
              }}
              onBlur={handleBlur}
              placeholder="e.g. 12500000"
              className={`w-full border p-3 rounded-xl text-sm font-semibold transition-colors ${
                touched.price && errors.price
                  ? "border-rose-400 ring-2 ring-rose-100 bg-rose-50/20"
                  : "border-gray-200 focus:border-indigo-500"
              }`}
            />
            {touched.price && errors.price && (
              <p className="mt-1 text-xs font-semibold text-rose-500 flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.price}</span>
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">City</label>
            <select
              name="city"
              value={values.city}
              onChange={handleChange}
              className="w-full border p-3 rounded-xl text-sm font-semibold border-gray-200"
            >
              <option value="Ahmedabad">Ahmedabad</option>
              <option value="Surat">Surat</option>
              <option value="Vadodara">Vadodara</option>
              <option value="Gandhinagar">Gandhinagar</option>
              <option value="Rajkot">Rajkot</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Locality / Address *</label>
            <input
              type="text"
              name="location"
              value={values.location}
              onChange={(e) => {
                setServerError("");
                handleChange(e);
              }}
              onBlur={handleBlur}
              placeholder="e.g. Bopal"
              className={`w-full border p-3 rounded-xl text-sm font-semibold transition-colors ${
                touched.location && errors.location
                  ? "border-rose-400 ring-2 ring-rose-100 bg-rose-50/20"
                  : "border-gray-200 focus:border-indigo-500"
              }`}
            />
            {touched.location && errors.location && (
              <p className="mt-1 text-xs font-semibold text-rose-500 flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.location}</span>
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Bedrooms</label>
            <input
              type="number"
              name="bedrooms"
              value={values.bedrooms}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full border p-3 rounded-xl text-sm font-semibold ${
                touched.bedrooms && errors.bedrooms ? "border-rose-400" : "border-gray-200"
              }`}
            />
            {touched.bedrooms && errors.bedrooms && (
              <p className="mt-1 text-xs font-semibold text-rose-500">{errors.bedrooms}</p>
            )}
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Bathrooms</label>
            <input
              type="number"
              name="bathrooms"
              value={values.bathrooms}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full border p-3 rounded-xl text-sm font-semibold ${
                touched.bathrooms && errors.bathrooms ? "border-rose-400" : "border-gray-200"
              }`}
            />
            {touched.bathrooms && errors.bathrooms && (
              <p className="mt-1 text-xs font-semibold text-rose-500">{errors.bathrooms}</p>
            )}
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Area (sq.ft)</label>
            <input
              type="number"
              name="area"
              value={values.area}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full border p-3 rounded-xl text-sm font-semibold ${
                touched.area && errors.area ? "border-rose-400" : "border-gray-200"
              }`}
            />
            {touched.area && errors.area && (
              <p className="mt-1 text-xs font-semibold text-rose-500">{errors.area}</p>
            )}
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Furnishing</label>
            <select
              name="furnishing"
              value={values.furnishing}
              onChange={handleChange}
              className="w-full border p-3 rounded-xl text-sm font-semibold border-gray-200"
            >
              <option value="Fully Furnished">Fully Furnished</option>
              <option value="Semi-Furnished">Semi-Furnished</option>
              <option value="Unfurnished">Unfurnished</option>
            </select>
          </div>
        </div>

        {/* Property Image Selection (File Upload & URL Link Options) */}
        <div className="space-y-3 bg-gray-50/70 p-5 rounded-2xl border border-gray-200">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold text-gray-800 block">Property Photo</label>
            <span className="text-[11px] text-gray-400 font-semibold">Choose Upload File OR Paste URL Link</span>
          </div>
          
          {/* Mode Switcher Buttons */}
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setImageMode("upload")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition-all ${
                imageMode === "upload"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>📁 Upload Photo File</span>
            </button>

            <button
              type="button"
              onClick={() => setImageMode("url")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition-all ${
                imageMode === "url"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>🔗 Paste Photo URL Link</span>
            </button>
          </div>


          {/* Mode 1: File Upload */}
          {imageMode === "upload" ? (
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-xs font-semibold text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />
              <p className="text-[11px] text-gray-400 font-medium">
                Select any photo file (JPG, PNG, WEBP) directly from your computer or mobile.
              </p>
            </div>
          ) : (
            /* Mode 2: URL Link */
            <div className="space-y-1">
              <input
                type="url"
                name="imageUrl"
                value={values.imageUrl}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="https://images.unsplash.com/photo-..."
                className={`w-full border p-3 rounded-xl text-sm font-semibold transition-colors bg-white ${
                  touched.imageUrl && errors.imageUrl ? "border-rose-400" : "border-gray-200 focus:border-indigo-500"
                }`}
              />
              {touched.imageUrl && errors.imageUrl && (
                <p className="mt-1 text-xs font-semibold text-rose-500 flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.imageUrl}</span>
                </p>
              )}
            </div>
          )}

          {/* Live Image Preview */}
          {values.imageUrl && (
            <div className="mt-3 relative inline-block">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Live Photo Preview</p>
              <div className="relative">
                <img
                  src={values.imageUrl}
                  alt="Property Preview"
                  className="w-36 h-28 object-cover rounded-xl border-2 border-indigo-300 shadow-md"
                />
                <button
                  type="button"
                  onClick={() => setFieldValue("imageUrl", "")}
                  className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-md hover:bg-rose-600 transition-all"
                  title="Remove Photo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>


        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1">Description</label>
          <textarea
            name="description"
            value={values.description}
            onChange={handleChange}
            placeholder="Describe features and amenities..."
            className="w-full border border-gray-200 p-3 rounded-xl text-sm h-28 font-medium"
          />
        </div>

        <div className="flex items-center space-x-4 pt-4 border-t border-ivory-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-forest-700 hover:bg-forest-800 disabled:opacity-60 text-white font-semibold px-8 py-3.5 rounded-xl shadow-subtle border border-forest-800 transition-all text-sm flex items-center space-x-2 active:scale-98"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
            <span>Publish Property Listing</span>
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-ivory-100 hover:bg-ivory-200 text-navy-800 font-semibold px-6 py-3.5 rounded-xl text-sm border border-ivory-300"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* AI Review Modal */}
      {aiModalOpen && aiGeneratedData && (
        <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[88vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-ivory-300 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-ivory-200 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-forest-100 text-forest-700 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-forest-700" />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-extrabold text-navy-900">
                    Review AI Generated Content
                  </h3>
                  <p className="text-xs text-navy-500 font-sans">
                    Select a generated headline and inspect the architectural description before applying.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAiModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-navy-900 rounded-lg hover:bg-ivory-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Title Options */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-navy-700 block">
                1. Select Property Title
              </label>
              <div className="space-y-2">
                {(aiGeneratedData.titles || []).map((t, idx) => (
                  <label
                    key={idx}
                    onClick={() => setSelectedTitleIndex(idx)}
                    className={`block p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedTitleIndex === idx
                        ? "bg-forest-50 border-forest-600 ring-2 ring-forest-200 shadow-2xs"
                        : "bg-ivory-50 border-ivory-300 hover:bg-ivory-100"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="aiTitle"
                        checked={selectedTitleIndex === idx}
                        onChange={() => setSelectedTitleIndex(idx)}
                        className="text-forest-700 focus:ring-forest-600 h-4 w-4"
                      />
                      <span className="text-xs font-bold text-navy-900">{t}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Generated Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-navy-700 block">
                2. Architectural Narrative Description
              </label>
              <div className="bg-ivory-50 border border-ivory-300 rounded-2xl p-4 text-xs text-navy-800 leading-relaxed font-sans max-h-48 overflow-y-auto whitespace-pre-line">
                {aiGeneratedData.description}
              </div>
            </div>

            {/* Key Highlights */}
            {aiGeneratedData.keyHighlights && aiGeneratedData.keyHighlights.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-navy-700 block">
                  3. Key Architectural Highlights
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {aiGeneratedData.keyHighlights.map((hl, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-2 text-xs font-medium text-navy-800 bg-white border border-ivory-300 rounded-xl px-3 py-2"
                    >
                      <Check className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-ivory-200">
              <button
                type="button"
                onClick={() => setAiModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-navy-700 hover:bg-ivory-100 border border-ivory-300"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleApplyAiContent}
                className="bg-forest-700 hover:bg-forest-800 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-subtle flex items-center space-x-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                <span>Apply to Listing Form</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProperty;
