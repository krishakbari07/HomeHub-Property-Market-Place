import mongoose from "mongoose";

const offerHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "countered", "withdrawn"],
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    actorRole: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
    },
    note: {
      type: String,
      default: "",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const offerSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "Property ID is required"],
      index: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Submitting client reference is required"],
      index: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Listing owner reference is required"],
      index: true,
    },
    listingCreator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    listingCreatorRole: {
      type: String,
      default: null,
      index: true,
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      default: null,
    },
    offerType: {
      type: String,
      enum: ["purchase", "rent"],
      required: [true, "Offer type (purchase or rent) is required"],
    },
    amount: {
      type: Number,
      required: [true, "Offer amount is required"],
      min: [1, "Offer amount must be a positive number"],
    },
    formattedAmount: {
      type: String,
      default: "",
    },
    askingPrice: {
      type: Number,
      required: [true, "Listing asking price is required"],
    },
    formattedAskingPrice: {
      type: String,
      default: "",
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "countered", "withdrawn"],
      default: "pending",
      index: true,
    },
    counterAmount: {
      type: Number,
      default: null,
    },
    formattedCounterAmount: {
      type: String,
      default: "",
    },
    counterNote: {
      type: String,
      default: "",
    },
    note: {
      type: String,
      default: "",
      maxlength: [1000, "Offer note cannot exceed 1000 characters"],
    },
    history: [offerHistorySchema],
  },
  { timestamps: true }
);

// Indexes for query performance and preventing duplicate pending offers
offerSchema.index({ property: 1, buyer: 1, status: 1 });
offerSchema.index({ seller: 1, status: 1 });
offerSchema.index({ agent: 1, status: 1 });
offerSchema.index({ createdAt: -1 });

const Offer = mongoose.model("Offer", offerSchema);
export default Offer;
