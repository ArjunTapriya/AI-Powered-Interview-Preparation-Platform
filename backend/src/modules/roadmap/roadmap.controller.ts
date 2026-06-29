import { Request, Response } from "express";
import { roadmapService } from "./roadmap.service";
import { sendSuccess } from "../../utils/apiResponse";
import { UnauthorizedError } from "../../utils/AppError";
import { UpdateRoadmapProgressInput } from "./roadmap.validation";

export class RoadmapController {
  /**
   * GET /api/roadmap
   * Returns the static syllabus roadmap catalog.
   */
  getRoadmap = async (_req: Request, res: Response): Promise<void> => {
    const nodes = await roadmapService.getRoadmap();
    sendSuccess(res, { nodes }, "Roadmap catalog retrieved successfully");
  };

  /**
   * GET /api/roadmap/progress
   * Returns array of node IDs completed by user.
   */
  getProgress = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.userId) {
      throw new UnauthorizedError("Access token is required");
    }
    const completedNodes = await roadmapService.getProgress(req.user.userId);
    sendSuccess(res, { completedNodes }, "Roadmap progress retrieved successfully");
  };

  /**
   * POST /api/roadmap/progress
   * Updates progress of a syllabus node for the authenticated user.
   */
  markProgress = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.userId) {
      throw new UnauthorizedError("Access token is required");
    }
    const { nodeId, completed } = req.body as UpdateRoadmapProgressInput;
    const completedNodes = await roadmapService.markProgress(
      req.user.userId,
      nodeId,
      completed
    );
    sendSuccess(res, { completedNodes }, "Roadmap progress updated successfully");
  };

  /**
   * GET /api/roadmap/recommendations
   * Returns dynamically generated recommendations based on Analytics.
   */
  getRecommendations = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.userId) {
      throw new UnauthorizedError("Access token is required");
    }
    const recommendation = await roadmapService.getRecommendations(req.user.userId);
    sendSuccess(res, { recommendation }, "Roadmap recommendation retrieved successfully");
  };
}

export const roadmapController = new RoadmapController();
