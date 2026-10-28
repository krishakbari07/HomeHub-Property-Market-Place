import express from "express";
import {
  logVisit,
  getAllVisitorLogs,
  clearVisitorLogs,
} from "../controllers/visitorController.js";

const router = express.Router();

router.post("/log", logVisit);
router.get("/all", getAllVisitorLogs);
router.delete("/clear", clearVisitorLogs);

export default router;
