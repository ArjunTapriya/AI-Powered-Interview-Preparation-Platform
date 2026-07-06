import { Router } from "express";
import { sendSuccess } from "../utils/apiResponse";
import { authRouter } from "../modules/auth/auth.routes";
import { usersRouter } from "../modules/users/users.routes";
import { interviewsRouter } from "../modules/interviews/interviews.routes";
import { evaluationsRouter } from "../modules/evaluations/evaluations.routes";
import { analyticsRouter } from "../modules/analytics/analytics.routes";
import { roadmapRouter } from "../modules/roadmap/roadmap.routes";
import { questionsRouter } from "../modules/questions/questions.routes";
import { executionRouter } from "../modules/code-execution/execution.routes";
import { aiRouter } from "../modules/ai/ai.routes";
import { resumesRouter } from "../modules/resumes/resume.routes";
import { subscriptionRouter } from "../modules/subscriptions/subscription.routes";
import { mentorRoutes } from "../modules/ai/mentor.routes";
// New modules (TODO 1, 2, 3)
import { voiceRouter } from "../modules/voice/voice.routes";
import { workspaceRouter } from "../modules/workspace/workspace.routes";
import { questionGenerationRouter } from "../modules/question-generation/question-generation.routes";
import { aiFeedbackRouter } from "../modules/ai-feedback/ai-feedback.routes";

/**
 * Central route aggregator.
 */
export function createApiRouter(): Router {
  const router = Router();

  router.use("/auth", authRouter);
  router.use("/users", usersRouter);
  router.use("/interviews", interviewsRouter);
  router.use("/evaluations", evaluationsRouter);
  router.use("/analytics", analyticsRouter);
  router.use("/roadmap", roadmapRouter);
  router.use("/questions", questionsRouter);
  router.use("/execution", executionRouter);
  router.use("/ai", aiRouter);
  router.use("/mentor", mentorRoutes);
  router.use("/resumes", resumesRouter);
  router.use("/subscriptions", subscriptionRouter);
  // TODO 1: Voice Interview
  router.use("/voice", voiceRouter);
  // TODO 2: Workspace Persistence
  router.use("/workspace", workspaceRouter);
  // TODO 3: Question Generation
  router.use("/question-generation", questionGenerationRouter);
  
  router.use("/ai-feedback", aiFeedbackRouter);

  router.get("/", (_req, res) => {
    return sendSuccess(res, { version: "1.0.0" }, "Interview Preparation Platform API");
  });

  return router;
}
