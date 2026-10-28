import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Property title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Property description is required"],
    },
    price: {
      type: Number,
      required: [true, "Property price is required"],
      index: true,
    },
    formattedPrice: {
      type: String,
    },
    purpose: {
      type: String,
      enum: ["buy", "rent", "Buy", "Rent", "Sale", "For Sale", "For Rent"],
      default: "buy",
      index: true,
    },
    listingType: {
      type: String,
      default: "buy",
    },
    type: {
      type: String,
      default: "Apartment",
      index: true,
    },
    propertyType: {
      type: String,
      default: "Apartment",
    },
    bedrooms: {
      type: Number,
      default: 3,
    },
    bathrooms: {
      type: Number,
      default: 2,
    },
    area: {
      type: Number,
      default: 1500,
    },
    areaSqFt: {
      type: Number,
      default: 1500,
    },
    furnishing: {
      type: String,
      default: "Fully Furnished",
    },
    location: {
      type: String,
      required: [true, "Property location is required"],
    },
    address: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      required: [true, "Property city is required"],
      default: "Ahmedabad",
      index: true,
    },
    state: {
      type: String,
      default: "Gujarat",
    },
    pincode: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    },
    images: {
      type: [String],
      default: [],
    },
    amenities: {
      type: [String],
      default: [],
    },
    features: {
      type: [String],
      default: [],
    },
    tag: {
      type: String,
      default: "For Sale",
    },
    badgeText: {
      type: String,
      default: "New Listing",
    },
    status: {
      type: String,
      enum: ["Available", "Sold", "Rented"],
      default: "Available",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    ownerName: {
      type: String,
      default: "Verified Seller",
    },
    ownerRole: {
      type: String,
      default: "Seller",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    creatorRole: {
      type: String,
      default: null,
      index: true,
    },
    needsManualReview: {
      type: Boolean,
      default: false,
    },
    sellerName: {
      type: String,
      default: "Verified Seller",
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    aiMatchScore: {
      type: Number,
      default: 92,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound indexes for high-speed search and sorting performance
propertySchema.index({ purpose: 1, city: 1, price: 1 });
propertySchema.index({ purpose: 1, type: 1, price: 1 });
propertySchema.index({ createdAt: -1 });

const Property = mongoose.model("Property", propertySchema);
export default Property;
