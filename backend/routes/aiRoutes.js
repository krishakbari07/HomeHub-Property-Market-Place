import express from "express";
import {
  aiChat,
  aiSmartSearch,
  getAiRecommendations,
  generateListingAiContent,
  getAiValuation,
} from "../controllers/aiController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Feature 1: AI Chatbot using real listings context (RAG)
router.post("/chat", aiChat);

// Feature 2: Natural-Language Smart Property Search
router.post("/smart-search", aiSmartSearch);

// Feature 3: Personalized Property Recommendations
router.post("/recommendations", getAiRecommendations);

// Feature 4: AI Listing Title and Description Generator (Protected: Sellers, Agents, Admins)
router.post(
  "/generate-description",
  protect,
  authorize("seller", "agent", "admin"),
  generateListingAiContent
);

// Feature 5: Property Price Estimator using comparable listings
router.post("/valuation", getAiValuation);

export default router;
