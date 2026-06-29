import { Request, Response } from 'express';
import { AdminService } from './admin.service';
import { UpdateUserDto, UpdateSubscriptionDto, FeatureFlagDto, SupportTicketDto } from './admin.dto';
import { seedGenerationService } from "../question-generation/seed-generation.service";
import { logger } from "../../utils/logger";
import { sendSuccess, sendError } from "../../utils/apiResponse";

export class AdminController {
  private static service = new AdminService();

  // Users
  static async listUsers(_req: Request, res: Response) {
    const users = await this.service.listUsers();
    return res.json({ data: users });
  }

  static async updateUser(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const payload: UpdateUserDto = req.body;
    const user = await this.service.updateUser(id, payload);
    return res.json({ data: user });
  }

  static async deleteUser(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const user = await this.service.deleteUser(id);
    return res.json({ data: user });
  }

  // Subscriptions
  static async listSubscriptions(_req: Request, res: Response) {
    const subs = await this.service.listSubscriptions();
    return res.json({ data: subs });
  }

  static async updateSubscription(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const payload: UpdateSubscriptionDto = req.body;
    const sub = await this.service.updateSubscription(id, payload);
    return res.json({ data: sub });
  }

  // Feature Flags
  static async listFeatureFlags(_req: Request, res: Response) {
    const flags = await this.service.listFeatureFlags();
    return res.json({ data: flags });
  }

  static async createFeatureFlag(req: Request, res: Response) {
    const payload: FeatureFlagDto = req.body;
    const flag = await this.service.createFeatureFlag(payload);
    return res.json({ data: flag });
  }

  static async updateFeatureFlag(req: Request, res: Response) {
    const id = req.params.id as string;
    const payload: Partial<FeatureFlagDto> = req.body;
    const flag = await this.service.updateFeatureFlag(id, payload);
    return res.json({ data: flag });
  }

  static async deleteFeatureFlag(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const flag = await this.service.deleteFeatureFlag(id);
    return res.json({ data: flag });
  }

  // Support Tickets
  static async listSupportTickets(_req: Request, res: Response) {
    const tickets = await this.service.listSupportTickets();
    return res.json({ data: tickets });
  }

  static async createSupportTicket(req: Request, res: Response) {
    const payload: SupportTicketDto = req.body;
    const userId = (req as any).user.id;
    const ticket = await this.service.createSupportTicket({ ...payload, userId });
    return res.json({ data: ticket });
  }

  static async updateSupportTicket(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const payload: Partial<SupportTicketDto> = req.body;
    const ticket = await this.service.updateSupportTicket(id, payload);
    return res.json({ data: ticket });
  }

  static async deleteSupportTicket(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const ticket = await this.service.deleteSupportTicket(id);
    return res.json({ data: ticket });
  }

  // Analytics
  static async getRevenueStats(_req: Request, res: Response) {
    const stats = await this.service.getRevenueStats();
    return res.json({ data: stats });
  }

  static async getAiUsageStats(_req: Request, res: Response) {
    const stats = await this.service.getAiUsageStats();
    return res.json({ data: stats });
  }

  static async getUserGrowthStats(_req: Request, res: Response) {
    const stats = await this.service.getUserGrowthStats();
    return res.json({ data: stats });
  }

  // Question Generation Pipeline
  static async generateQuestion(req: Request, res: Response) {
    try {
      const { topic, difficulty } = req.body;
      if (!topic || !difficulty) {
        return sendError(res, "Missing topic or difficulty", 400);
      }

      // We run this asynchronously because it can take 30-60 seconds depending on LLM speeds
      // and we don't want to block the HTTP response. In a real system, we'd use a message queue.
      setImmediate(async () => {
        try {
          await seedGenerationService.generateAndSaveFullQuestion(topic, difficulty);
        } catch (error) {
          logger.error("Async Question Generation Failed:", error);
        }
      });

      return sendSuccess(res, null, "Question generation started in the background. It will be available in the question bank shortly.", 202);
    } catch (error: any) {
      logger.error("Failed to trigger question generation:", error);
      return sendError(res, error.message || "Failed to trigger question generation", 500);
    }
  }
}
