import { Router } from "express";
import { mentorController } from "./mentor.controller";
import { authenticate } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { rateLimiter } from "../../middleware/security";

const router = Router();

router.use(authenticate);
router.use(rateLimiter); // Apply rate limits to AI endpoints to prevent abuse

// AI Mentor Chat
router.post("/chat", asyncHandler(mentorController.chat));

// AI Mentor Quick Actions
router.post("/hint", asyncHandler(mentorController.requestHint));
router.post("/debug", asyncHandler(mentorController.debugCode));
router.post("/complexity", asyncHandler(mentorController.analyzeComplexity));

export const mentorRoutes = router;
