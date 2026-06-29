import { Router } from "express";
import { subscriptionController } from "./subscription.controller";
import { authenticate } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";

const subscriptionRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Subscriptions
 *   description: Razorpay-powered subscription management (FREE / PRO / PREMIUM)
 */

/**
 * @swagger
 * /subscriptions/me:
 *   get:
 *     summary: Get current user's subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription details and plan limits
 */
subscriptionRouter.get("/me", authenticate, asyncHandler(subscriptionController.getSubscription));

/**
 * @swagger
 * /subscriptions/plans:
 *   get:
 *     summary: Get plan feature limits for all tiers
 *     tags: [Subscriptions]
 *     responses:
 *       200:
 *         description: Feature limits per plan
 */
subscriptionRouter.get("/plans", asyncHandler(subscriptionController.getPlanLimits));

/**
 * @swagger
 * /subscriptions/order:
 *   post:
 *     summary: Create a Razorpay payment order
 *     description: Creates a Razorpay order to initiate checkout. Returns orderId and keyId needed by the frontend Razorpay checkout widget.
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - plan
 *             properties:
 *               plan:
 *                 type: string
 *                 enum: [PRO, PREMIUM]
 *     responses:
 *       201:
 *         description: Order created. Contains orderId and keyId for checkout.
 *       400:
 *         description: Invalid plan
 *       503:
 *         description: Payment gateway not configured
 */
subscriptionRouter.post("/order", authenticate, asyncHandler(subscriptionController.createOrder));

/**
 * @swagger
 * /subscriptions/verify:
 *   post:
 *     summary: Verify Razorpay payment and activate subscription
 *     description: Verifies the HMAC-SHA256 payment signature and activates the subscription on success.
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - paymentId
 *               - signature
 *             properties:
 *               orderId:
 *                 type: string
 *               paymentId:
 *                 type: string
 *               signature:
 *                 type: string
 *     responses:
 *       200:
 *         description: Subscription activated
 *       403:
 *         description: Invalid signature
 */
subscriptionRouter.post("/verify", authenticate, asyncHandler(subscriptionController.verifyPayment));

/**
 * @swagger
 * /subscriptions/cancel:
 *   post:
 *     summary: Cancel current subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription cancelled
 *       400:
 *         description: No active subscription
 */
subscriptionRouter.post("/cancel", authenticate, asyncHandler(subscriptionController.cancelSubscription));

export { subscriptionRouter };
