import { Request, Response } from "express";
import { analyticsService } from "./analytics.service";
import { sendSuccess } from "../../utils/apiResponse";
import { UnauthorizedError } from "../../utils/AppError";

export class AnalyticsController {
  getDashboardSummary = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.userId) throw new UnauthorizedError("Access token is required");
    const summary = await analyticsService.getDashboardSummary(req.user.userId);
    sendSuccess(res, { summary }, "Dashboard summary retrieved");
  };

  getSkillBreakdown = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.userId) throw new UnauthorizedError("Access token is required");
    const skills = await analyticsService.getSkillBreakdown(req.user.userId);
    sendSuccess(res, { skills }, "Skill breakdown retrieved");
  };

  getTrends = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.userId) throw new UnauthorizedError("Access token is required");
    const period = (req.query.period as "daily" | "weekly" | "monthly") || "daily";
    const trends = await analyticsService.getTrends(req.user.userId, period);
    sendSuccess(res, { trends }, "Trends retrieved");
  };

  getInsights = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.userId) throw new UnauthorizedError("Access token is required");
    const insights = await analyticsService.getInsights(req.user.userId);
    sendSuccess(res, { insights }, "Performance insights retrieved");
  };
}

export const analyticsController = new AnalyticsController();
