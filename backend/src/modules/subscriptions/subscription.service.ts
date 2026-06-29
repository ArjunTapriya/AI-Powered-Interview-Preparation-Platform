import crypto from "crypto";
import { env } from "../../config/env";
import { subscriptionRepository } from "./subscription.repository";
import { logger } from "../../utils/logger";
import { NotFoundError, ForbiddenError, AppError } from "../../utils/AppError";
import { SubscriptionPlan } from "@prisma/client";

// Plan prices in paise (INR): 1 INR = 100 paise
const PLAN_PRICES: Record<string, number> = {
  PRO: 49900,      // ₹499/month
  PREMIUM: 99900,  // ₹999/month
};

// Feature limits per plan
export const PLAN_LIMITS = {
  FREE: {
    aiEvaluations: 3,
    codeSubmissions: 10,
    resumeUploads: 1,
    practiceSessionsPerDay: 2,
  },
  PRO: {
    aiEvaluations: 50,
    codeSubmissions: 200,
    resumeUploads: 5,
    practiceSessionsPerDay: 20,
  },
  PREMIUM: {
    aiEvaluations: -1,    // unlimited
    codeSubmissions: -1,
    resumeUploads: -1,
    practiceSessionsPerDay: -1,
  },
};

export class SubscriptionService {
  /**
   * Create a Razorpay order via REST API and log the transaction.
   */
  async createOrder(userId: string, plan: string) {
    if (!["PRO", "PREMIUM"].includes(plan)) {
      throw new AppError("Invalid plan. Choose PRO or PREMIUM.", 400);
    }

    const amount = PLAN_PRICES[plan];
    if (!amount) throw new AppError("Plan pricing not configured.", 500);

    const keyId = env.RAZORPAY_KEY_ID;
    const keySecret = env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new AppError("Payment gateway not configured. Contact support.", 503);
    }

    const credentials = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    // Create Razorpay order via REST API
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify({
        amount,
        currency: "INR",
        receipt: `order_${userId}_${Date.now()}`,
        notes: { userId, plan },
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      logger.error("Razorpay order creation failed", { status: response.status, body: errBody });
      throw new AppError(`Payment gateway error: ${response.statusText}`, 502);
    }

    const order = (await response.json()) as any;

    // Log pending transaction
    await subscriptionRepository.createTransaction({
      userId,
      razorpayOrderId: order.id,
      amount,
      plan: plan as SubscriptionPlan,
    });

    logger.info(`Razorpay order created: ${order.id} for user ${userId} plan ${plan}`);

    return {
      orderId: order.id,
      amount,
      currency: "INR",
      keyId,        // needed by frontend Razorpay checkout
      plan,
    };
  }

  /**
   * Verify Razorpay payment signature and activate subscription.
   */
  async verifyPayment(
    userId: string,
    input: { orderId: string; paymentId: string; signature: string }
  ) {
    const { orderId, paymentId, signature } = input;

    const keySecret = env.RAZORPAY_KEY_SECRET;
    if (!keySecret) throw new AppError("Payment gateway not configured.", 503);

    // HMAC-SHA256 signature verification
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (expectedSignature !== signature) {
      logger.warn(`Invalid payment signature for order ${orderId} by user ${userId}`);
      // Mark transaction as failed
      await subscriptionRepository.updateTransaction(orderId, {
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        status: "FAILED",
      });
      throw new ForbiddenError("Payment signature verification failed.");
    }

    // Get pending transaction to know the plan
    const transaction = await subscriptionRepository.findTransaction(orderId);
    if (!transaction) {
      throw new NotFoundError("Payment transaction not found.");
    }

    // Mark transaction as captured
    await subscriptionRepository.updateTransaction(orderId, {
      razorpayPaymentId: paymentId,
      razorpaySignature: signature,
      status: "CAPTURED",
    });

    // Activate subscription
    const subscription = await subscriptionRepository.upsertSubscription(
      userId,
      transaction.plan,
      paymentId,
      orderId
    );

    logger.info(`Subscription activated: user=${userId} plan=${transaction.plan} payment=${paymentId}`);

    return {
      plan: subscription.plan,
      status: subscription.status,
      startDate: subscription.startDate,
      message: `${transaction.plan} plan activated successfully!`,
    };
  }

  /**
   * Get the current subscription for a user.
   */
  async getSubscription(userId: string) {
    const sub = await subscriptionRepository.getSubscription(userId);
    if (!sub) {
      // Return free plan if no subscription record
      return {
        plan: "FREE",
        status: "ACTIVE",
        startDate: null,
        endDate: null,
        limits: PLAN_LIMITS.FREE,
      };
    }

    return {
      plan: sub.plan,
      status: sub.status,
      startDate: sub.startDate,
      endDate: sub.endDate,
      limits: PLAN_LIMITS[sub.plan] || PLAN_LIMITS.FREE,
    };
  }

  /**
   * Cancel the user's active subscription.
   */
  async cancelSubscription(userId: string) {
    const sub = await subscriptionRepository.getSubscription(userId);
    if (!sub || sub.status !== "ACTIVE") {
      throw new AppError("No active subscription to cancel.", 400);
    }

    const cancelled = await subscriptionRepository.cancelSubscription(userId);
    logger.info(`Subscription cancelled for user ${userId}`);

    return {
      plan: cancelled.plan,
      status: cancelled.status,
      endDate: cancelled.endDate,
      message: "Subscription cancelled. Access continues until the end date.",
    };
  }

  /**
   * Return plan feature limits.
   */
  getPlanLimits() {
    return PLAN_LIMITS;
  }
}

export const subscriptionService = new SubscriptionService();
