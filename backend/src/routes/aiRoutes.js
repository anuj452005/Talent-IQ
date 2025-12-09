import express from "express";
import { aiReviewCode, aiGetHint, aiExplainCode } from "../controllers/aiController.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

// All AI routes require authentication
router.post("/review", protectRoute, aiReviewCode);
router.post("/hint", protectRoute, aiGetHint);
router.post("/explain", protectRoute, aiExplainCode);

export default router;
