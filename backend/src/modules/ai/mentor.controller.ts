import { Request, Response } from "express";
import { mentorAgentService } from "./mentor-agent.service";
import { sendSuccess, sendError } from "../../utils/apiResponse";
import { logger } from "../../utils/logger";

export const mentorController = {
  /**
   * Handle chat interactions with the AI Mentor
   */
  chat: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { interviewSessionId, questionId, message, currentCode } = req.body;

      if (!interviewSessionId || !questionId || !message) {
        return sendError(res, "Missing required fields: interviewSessionId, questionId, message", 400);
      }

      const result = await mentorAgentService.getMentorResponse(
        userId,
        interviewSessionId,
        questionId,
        message,
        currentCode || "",
        "general"
      );

      return sendSuccess(res, result, "Mentor response generated successfully", 200);
    } catch (error: any) {
      logger.error("Mentor Chat Error:", error);
      return sendError(res, error.message || "Failed to generate mentor response", 500);
    }
  },

  /**
   * Quick action: Request a hint
   */
  requestHint: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { interviewSessionId, questionId, currentCode } = req.body;

      const message = "I'm stuck. Can you give me a small hint without revealing the entire solution?";

      const result = await mentorAgentService.getMentorResponse(
        userId,
        interviewSessionId,
        questionId,
        message,
        currentCode || "",
        "hint"
      );

      return sendSuccess(res, result, "Hint generated successfully", 200);
    } catch (error: any) {
      logger.error("Mentor Hint Error:", error);
      return sendError(res, error.message || "Failed to generate hint", 500);
    }
  },

  /**
   * Quick action: Debug code
   */
  debugCode: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { interviewSessionId, questionId, currentCode, errorLogs } = req.body;

      const message = "My code isn't working as expected. Can you spot any logical flaws or syntax errors?";

      const result = await mentorAgentService.getMentorResponse(
        userId,
        interviewSessionId,
        questionId,
        message,
        currentCode || "",
        "debug",
        errorLogs
      );

      return sendSuccess(res, result, "Debug analysis generated successfully", 200);
    } catch (error: any) {
      logger.error("Mentor Debug Error:", error);
      return sendError(res, error.message || "Failed to debug code", 500);
    }
  },

  /**
   * Quick action: Complexity analysis
   */
  analyzeComplexity: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { interviewSessionId, questionId, currentCode } = req.body;

      const message = "Can you analyze the time and space complexity of my current code?";

      const result = await mentorAgentService.getMentorResponse(
        userId,
        interviewSessionId,
        questionId,
        message,
        currentCode || "",
        "complexity"
      );

      return sendSuccess(res, result, "Complexity analysis generated successfully", 200);
    } catch (error: any) {
      logger.error("Mentor Complexity Error:", error);
      return sendError(res, error.message || "Failed to analyze complexity", 500);
    }
  }
};
