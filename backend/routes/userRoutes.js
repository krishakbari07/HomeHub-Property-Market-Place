import express from "express";
import {
  getCurrentUserProfile,
  updateCurrentUserProfile,
  getAgents,
  getAllUsers,
  createUserByAdmin,
  updateUserById,
  deleteUserById,
  getAgentClients,
} from "../controllers/userController.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public / Protected agent lookup
router.get("/agents", getAgents);

// Agent CRM Clients lookup
router.get("/agent/clients", protect, getAgentClients);

// User self profile routes
router.get("/me", protect, getCurrentUserProfile);
router.put("/me", protect, updateCurrentUserProfile);

// Admin-only user management routes
router.get("/", protect, requireAdmin, getAllUsers);
router.post("/", protect, requireAdmin, createUserByAdmin);
router.put("/:id", protect, requireAdmin, updateUserById);
router.delete("/:id", protect, requireAdmin, deleteUserById);

export default router;

