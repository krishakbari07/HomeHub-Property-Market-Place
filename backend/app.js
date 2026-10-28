import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import "dotenv/config";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import inquiryRoutes from "./routes/inquiryRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import visitorRoutes from "./routes/visitorRoutes.js";
import offerRoutes from "./routes/offerRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

// Rate limiter for Auth endpoints (skipping CORS preflight OPTIONS)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many authentication requests, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS",
});

// Configure CORS for local development and production deployments
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",").map((o) => o.trim()) : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        process.env.NODE_ENV !== "production" ||
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Explicit Healthcheck Handlers
const healthCheckHandler = (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(isDbConnected ? 200 : 503).json({
    status: isDbConnected ? "OK" : "DEGRADED",
    service: "homehub-backend",
    uptime: Math.floor(process.uptime()),
    database: isDbConnected ? "connected" : "disconnected",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
};

app.get("/", healthCheckHandler);
app.get("/health", healthCheckHandler);
app.get("/api/health", healthCheckHandler);

// Apply rate limiting to Auth routes
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/visitors", visitorRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/notifications", notificationRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

import { cleanupDuplicates } from "./cleanupDuplicateUsers.js";

// Non-sensitive Startup Environment Validation
const validateEnv = () => {
  const missing = [];
  if (!process.env.MONGO_URI) missing.push("MONGO_URI");
  if (!process.env.JWT_SECRET) missing.push("JWT_SECRET");

  if (missing.length > 0) {
    console.error(`❌ Startup Error: Missing required environment variable(s): ${missing.join(", ")}`);
    console.error(`Please check backend/.env or your deployment environment settings.`);
    process.exit(1);
  }

  if (!process.env.GEMINI_API_KEY) {
    console.warn("⚠️ Advisory: GEMINI_API_KEY is not defined. AI features will run with fallback responses.");
  }
};

const PORT = process.env.PORT || 5000;

validateEnv();

// Connect DB first, then listen on 0.0.0.0 to accept IPv4 (127.0.0.1) & IPv6 (::) connections
connectDB()
  .then(async () => {
    await cleanupDuplicates();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`==================================================`);
      console.log(`🚀 HomeHub Express Server running on port ${PORT}`);
      console.log(`📍 REST API available at http://127.0.0.1:${PORT}/api & http://localhost:${PORT}/api`);
      console.log(`==================================================`);
    });
  })
  .catch((error) => {
    console.error("❌ Failed to start server due to DB connection error:", error);
    process.exit(1);
  });

export default app;