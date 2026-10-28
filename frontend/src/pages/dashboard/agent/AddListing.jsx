import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Building2, CheckCircle2 } from "lucide-react";
import { useProperty } from "../../../context/PropertyContext";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";

const AddListing = () => {
  const navigate = useNavigate();
  const { addProperty } = useProperty();
  const { user } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [purpose, setPurpose] = useState("buy");
  const [type, setType] = useState("Villa");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("Ahmedabad");
  const [bedrooms, setBedrooms] = useState("4");
  const [bathrooms, setBathrooms] = useState("4");
  const [area, setArea] = useState("2400");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !price || !location) {
      toast.warning("Please fill in required fields: Title, Price, and Location are required.");
      return;
    }

    const numPrice = Number(price);

    try {
      await addProperty({
        title,
        description: "Exclusive agent-managed verified listing.",
        type,
        propertyType: type,
        purpose,
        listingType: purpose,
        price: numPrice,
        location: `${location}, ${city}`,
        city,
        state: "Gujarat",
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        area: Number(area),
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        tag: purpose === "rent" ? "For Rent" : "For Sale",
        badgeText: "Agent Listing",
      });

      setSuccess(true);
      toast.success("Client property listing published successfully!");
      setTimeout(() => {
        navigate("/agent/listings");
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to publish listing.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <h1 className="text-3xl font-black text-gray-900">Add Agent Listing</h1>
        <p className="text-gray-500 text-sm mt-1">Publish verified client property to HomeHub.</p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center space-x-3 font-semibold text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Listing published successfully! Redirecting...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-4">
        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1">Listing Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Modern Executive Villa"
            className="w-full border p-3 rounded-xl text-sm font-semibold"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Purpose</label>
            <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full border p-3 rounded-xl text-sm font-semibold">
              <option value="buy">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border p-3 rounded-xl text-sm font-semibold">
              <option value="Villa">Villa</option>
              <option value="Apartment">Apartment</option>
              <option value="Flat">Flat</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Price (₹) *</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border p-3 rounded-xl text-sm font-semibold" required />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Locality *</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Satellite" className="w-full border p-3 rounded-xl text-sm font-semibold" required />
          </div>
        </div>

        <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-md">
          Publish Agent Listing
        </button>
      </form>
    </div>
  );
};

export default AddListing;
