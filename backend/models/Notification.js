import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recipient is required"],
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    type: {
      type: String,
      required: [true, "Notification type is required"],
      enum: [
        "offer_submitted",
        "offer_accepted",
        "offer_rejected",
        "offer_countered",
        "offer_withdrawn",
        "offer_counter_accepted",
        "offer_counter_rejected",
        "inquiry_submitted",
        "inquiry_replied",
        "inquiry_status_changed",
        "appointment_created",
        "appointment_confirmed",
        "appointment_rescheduled",
        "appointment_cancelled",
        "system",
      ],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      default: null,
      index: true,
    },
    propertyTitle: {
      type: String,
      default: "",
    },
    resourceType: {
      type: String,
      enum: ["offer", "inquiry", "appointment", "property", "general"],
      default: "general",
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    link: {
      type: String,
      default: "",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for query optimization
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, resourceId: 1, type: 1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
