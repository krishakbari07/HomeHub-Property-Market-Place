import express from "express";
import {
  createAppointment,
  getMyAppointments,
  getAgentAppointments,
  getAllAppointments,
  getAppointmentById,
  cancelAppointment,
  updateAppointmentStatus,
  deleteAppointment,
} from "../controllers/appointmentController.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createAppointment);
router.get("/my", protect, getMyAppointments);
router.get("/agent", protect, getAgentAppointments);
router.get("/all", protect, requireAdmin, getAllAppointments);
router.get("/:id", protect, getAppointmentById);
router.put("/:id/cancel", protect, cancelAppointment);
router.put("/:id", protect, updateAppointmentStatus);
router.delete("/:id", protect, deleteAppointment);

export default router;

