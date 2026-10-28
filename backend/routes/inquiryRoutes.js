import express from "express";
import {
  createInquiry,
  getMyInquiries,
  getAllInquiries,
  updateInquiryStatus,
  deleteInquiry,
} from "../controllers/inquiryController.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createInquiry);
router.get("/", protect, getMyInquiries);
router.get("/all", protect, requireAdmin, getAllInquiries);
router.put("/:id", protect, updateInquiryStatus);
router.delete("/:id", protect, deleteInquiry);

export default router;

