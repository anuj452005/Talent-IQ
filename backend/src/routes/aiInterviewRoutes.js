import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { 
  startAISession, 
  sendMessage, 
  endAISession, 
  getAISession 
} from "../controllers/aiInterviewController.js";

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

// Start a new AI interview session
router.post("/start", startAISession);

// Send message to AI interviewer
router.post("/message", sendMessage);

// End AI session and get feedback
router.post("/end", endAISession);

// Get AI session details
router.get("/:id", getAISession);

export default router;
