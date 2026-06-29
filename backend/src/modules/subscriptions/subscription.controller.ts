import { Request, Response } from "express";
import { subscriptionService } from "./subscription.service";
import { sendSuccess, sendError } from "../../utils/apiResponse";

export const subscriptionController = {
  async getSubscription(req: Request, res: Response) {
    const userId = (req as any).user?.userId;
    const result = await subscriptionService.getSubscription(userId);
    return sendSuccess(res, result, "Subscription retrieved.");
  },

  async createOrder(req: Request, res: Response) {
    const userId = (req as any).user?.userId;
    const { plan } = req.body;
    if (!plan) return sendError(res, "plan is required (PRO or PREMIUM)", 400);
    const result = await subscriptionService.createOrder(userId, plan);
    return sendSuccess(res, result, "Order created. Proceed to payment.", 201);
  },

  async verifyPayment(req: Request, res: Response) {
    const userId = (req as any).user?.userId;
    const { orderId, paymentId, signature } = req.body;
    if (!orderId || !paymentId || !signature) {
      return sendError(res, "orderId, paymentId, and signature are required.", 400);
    }
    const result = await subscriptionService.verifyPayment(userId, { orderId, paymentId, signature });
    return sendSuccess(res, result, result.message);
  },

  async cancelSubscription(req: Request, res: Response) {
    const userId = (req as any).user?.userId;
    const result = await subscriptionService.cancelSubscription(userId);
    return sendSuccess(res, result, result.message);
  },

  async getPlanLimits(_req: Request, res: Response) {
    const limits = subscriptionService.getPlanLimits();
    return sendSuccess(res, { limits }, "Plan limits retrieved.");
  },
};
