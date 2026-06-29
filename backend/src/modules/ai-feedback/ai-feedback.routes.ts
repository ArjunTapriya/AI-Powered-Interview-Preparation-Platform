import { Router } from "express";
import { aiFeedbackController } from "./ai-feedback.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/conversations", aiFeedbackController.getConversations);
router.post("/conversations", aiFeedbackController.createConversation);
router.post("/conversations/:conversationId/message", aiFeedbackController.sendMessage);

export { router as aiFeedbackRouter };
