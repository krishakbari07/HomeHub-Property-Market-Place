import express from "express";
import {
  submitOffer,
  getMyOffers,
  getSellerOffers,
  getAgentOffers,
  getAdminOffers,
  getOfferById,
  acceptOffer,
  rejectOffer,
  counterOffer,
  withdrawOffer,
  respondToCounter,
} from "../controllers/offerController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Client offer submission and retrieval
router.post("/", protect, submitOffer);
router.get("/my", protect, getMyOffers);

// Admin, Seller & Agent listing offer management
router.get("/admin", protect, getAdminOffers);
router.get("/seller", protect, getSellerOffers);
router.get("/agent", protect, getAgentOffers);

// Single offer details
router.get("/:id", protect, getOfferById);

// Offer status mutation workflows
router.put("/:id/accept", protect, acceptOffer);
router.put("/:id/reject", protect, rejectOffer);
router.put("/:id/counter", protect, counterOffer);
router.put("/:id/withdraw", protect, withdrawOffer);
router.put("/:id/respond-counter", protect, respondToCounter);

export default router;
