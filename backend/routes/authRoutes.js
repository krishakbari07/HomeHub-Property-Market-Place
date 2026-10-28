import express from "express";
import {
  registerUser,
  resetPassword,
  loginUser,
  getMe,
  logoutUser,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Registration & Password Reset
router.post("/register", registerUser);
router.post("/reset-password", resetPassword);
router.post("/reset-password-with-otp", resetPassword); // backwards-compatible alias

// Session & Profile
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.get("/profile", protect, getMe);
router.post("/logout", logoutUser);

export default router;
