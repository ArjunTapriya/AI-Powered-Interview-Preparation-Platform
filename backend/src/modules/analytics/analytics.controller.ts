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

  logHeartbeat = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.userId) throw new UnauthorizedError("Access token is required");
    const durationSeconds = Number(req.body.durationSeconds) || 30;
    const dateStr = req.body.dateStr;
    await analyticsService.logHeartbeat(req.user.userId, durationSeconds, dateStr);
    sendSuccess(res, null, "Heartbeat logged successfully");
  };

  getWeeklyActivity = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.userId) throw new UnauthorizedError("Access token is required");
    
    let dateStrings: string[] = [];
    if (typeof req.query.dates === "string") {
      dateStrings = req.query.dates.split(",");
    } else if (Array.isArray(req.query.dates)) {
      dateStrings = req.query.dates as string[];
    }

    if (dateStrings.length === 0) {
      sendSuccess(res, { activity: [] }, "No dates query parameter provided");
      return;
    }

    const activity = await analyticsService.getWeeklyActivity(req.user.userId, dateStrings);
    sendSuccess(res, { activity }, "Weekly activity retrieved");
  };
}

export const analyticsController = new AnalyticsController();
