import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Edit3, CheckCircle2, ArrowLeft, Loader2, AlertCircle, Upload, Link as LinkIcon, X } from "lucide-react";
import { useProperty } from "../../../context/PropertyContext";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { userApi } from "../../../services/api";
import useFormValidation from "../../../hooks/useFormValidation";

const EDIT_PROPERTY_SCHEMA = {
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
  image: {
    label: "Image URL",
    url: true,
  },
};

const EditProperty = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { fetchPropertyById, updateProperty } = useProperty();
  const { user } = useAuth();
  const { toast } = useToast();

  const [loadingProperty, setLoadingProperty] = useState(true);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [agentsList, setAgentsList] = useState([]);
  const [imageMode, setImageMode] = useState("upload"); // "upload" or "url"

  const {
    values,
    setValues,
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
      image: "",
      status: "Available",
      agent: "",
    },
    EDIT_PROPERTY_SCHEMA
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

  useEffect(() => {
    let isMounted = true;
    if (id) {
      setLoadingProperty(true);
      fetchPropertyById(id)
        .then((prop) => {
          if (isMounted && prop) {
            const agentIdVal = typeof prop.agent === "object" ? prop.agent?._id || prop.agent?.id : prop.agent || "";
            setValues({
              title: prop.title || "",
              description: prop.description || "",
              type: prop.type || prop.propertyType || "Apartment",
              purpose: prop.purpose || prop.listingType || "buy",
              price: prop.price !== undefined ? String(prop.price) : "",
              location: prop.location || "",
              city: prop.city || "Ahmedabad",
              bedrooms: prop.bedrooms !== undefined ? String(prop.bedrooms) : "3",
              bathrooms: prop.bathrooms !== undefined ? String(prop.bathrooms) : "2",
              area: prop.area !== undefined ? String(prop.area) : prop.areaSqFt ? String(prop.areaSqFt) : "1500",
              furnishing: prop.furnishing || "Fully Furnished",
              image: prop.image || "",
              status: prop.status || "Available",
              agent: agentIdVal,
            });
          }
        })
        .catch((err) => {
          if (isMounted) setServerError("Failed to load property details: " + err.message);
        })
        .finally(() => {
          if (isMounted) setLoadingProperty(false);
        });
    } else {
      setLoadingProperty(false);
    }
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.warning("Image file size should be less than 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFieldValue("image", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (formValues) => {

    setServerError("");

    try {
      await updateProperty(id, {
        ...formValues,
        price: Number(formValues.price),
        bedrooms: Number(formValues.bedrooms),
        bathrooms: Number(formValues.bathrooms),
        area: Number(formValues.area),
        areaSqFt: Number(formValues.area),
      });

      setSuccess(true);
      setTimeout(() => {
        const isAgent = user?.role?.toLowerCase() === "agent";
        navigate(isAgent ? "/agent/listings" : "/seller/properties");
      }, 1500);
    } catch (err) {
      setServerError(err.message || "Failed to update property details.");
    }
  };

  if (loadingProperty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm font-semibold text-gray-500">Loading property data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-xs font-bold text-gray-400 hover:text-gray-600 flex items-center space-x-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-black text-gray-900">Edit Property Listing</h1>
          <p className="text-gray-500 text-sm mt-1">
            Update your property details on HomeHub marketplace.
          </p>
        </div>
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center font-bold">
          <Edit3 className="w-6 h-6" />
        </div>
      </div>

      {/* Notifications */}
      {serverError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center space-x-3 text-sm font-semibold">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center space-x-3 font-semibold text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Property updated successfully! Redirecting to dashboard...</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6" noValidate>
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Listing Purpose</label>
            <select
              name="purpose"
              value={values.purpose}
              onChange={handleChange}
              className="w-full border border-gray-200 p-3 rounded-xl text-sm font-semibold"
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
              className="w-full border border-gray-200 p-3 rounded-xl text-sm font-semibold"
            >
              <option value="Apartment">Apartment</option>
              <option value="Villa">Villa</option>
              <option value="Flat">Flat</option>
              <option value="Penthouse">Penthouse</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Listing Status</label>
            <select
              name="status"
              value={values.status}
              onChange={handleChange}
              className="w-full border border-gray-200 p-3 rounded-xl text-sm font-semibold"
            >
              <option value="Available">Available</option>
              <option value="Sold">Sold</option>
              <option value="Rented">Rented</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1">Assign Agent (Role: Agent)</label>
          <select
            name="agent"
            value={values.agent}
            onChange={handleChange}
            className="w-full border border-gray-200 p-3 rounded-xl text-sm font-semibold text-gray-800"
          >
            <option value="">Auto-assign or Select Agent</option>
            {agentsList.map((ag) => (
              <option key={ag._id || ag.id} value={ag._id || ag.id}>
                {ag.name} ({ag.email}) {ag.agencyName ? `- ${ag.agencyName}` : ""}
              </option>
            ))}
          </select>
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
              className="w-full border border-gray-200 p-3 rounded-xl text-sm font-semibold"
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
              className="w-full border border-gray-200 p-3 rounded-xl text-sm font-semibold"
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
                name="image"
                value={values.image}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="https://images.unsplash.com/photo-..."
                className={`w-full border p-3 rounded-xl text-sm font-semibold transition-colors bg-white ${
                  touched.image && errors.image ? "border-rose-400" : "border-gray-200 focus:border-indigo-500"
                }`}
              />
              {touched.image && errors.image && (
                <p className="mt-1 text-xs font-semibold text-rose-500 flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.image}</span>
                </p>
              )}
            </div>
          )}

          {/* Live Image Preview */}
          {values.image && (
            <div className="mt-3 relative inline-block">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Live Photo Preview</p>
              <div className="relative">
                <img
                  src={values.image}
                  alt="Property Preview"
                  className="w-36 h-28 object-cover rounded-xl border-2 border-indigo-300 shadow-md"
                />
                <button
                  type="button"
                  onClick={() => setFieldValue("image", "")}
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

        <div className="flex items-center space-x-4 pt-4 border-t">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-extrabold px-8 py-3.5 rounded-xl shadow-md transition-all text-sm flex items-center space-x-2"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit3 className="w-4 h-4" />}
            <span>Save Property Changes</span>
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-6 py-3.5 rounded-xl text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProperty;
