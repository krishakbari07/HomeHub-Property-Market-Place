import express from "express";
import {
  getProperties,
  getMyProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
} from "../controllers/propertyController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getProperties);
router.get("/my-properties", protect, getMyProperties);
router.get("/my-listings", protect, getMyProperties);
router.get("/:id", getPropertyById);
router.post("/", protect, authorize("admin", "seller", "agent"), createProperty);
router.put("/:id", protect, updateProperty);
router.delete("/:id", protect, deleteProperty);

export default router;
