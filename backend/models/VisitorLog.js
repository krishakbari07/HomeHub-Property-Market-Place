import mongoose from "mongoose";

const visitorLogSchema = new mongoose.Schema(
  {
    visitorId: { type: String, default: "" },
    isLoggedIn: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    userName: { type: String, default: "Guest Visitor (Not Logged In)" },
    userEmail: { type: String, default: "Anonymous Visitor" },
    userRole: { type: String, default: "Guest" },
    ipAddress: { type: String, default: "127.0.0.1" },
    pageVisited: { type: String, default: "/" },
    pageTitle: { type: String, default: "HomeHub Real Estate" },
    device: { type: String, default: "Desktop Browser" },
    userAgent: { type: String, default: "" },
  },
  { timestamps: true }
);

const VisitorLog = mongoose.model("VisitorLog", visitorLogSchema);
export default VisitorLog;
