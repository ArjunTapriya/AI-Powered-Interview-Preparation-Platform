import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { authController } from "./auth.controller";
import { signupSchema, loginSchema } from "./auth.validation";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";

const REFRESH_TOKEN_COOKIE = "rft";

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later",
    data: null,
  },
});

const authRouter = Router();

/**
 * Helper: set refresh token as httpOnly cookie.
 */
export function setRefreshTokenCookie(res: Response, token: string): void {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie(REFRESH_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/api/auth",
  });
}

/**
 * Helper: clear refresh token cookie.
 */
export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(REFRESH_TOKEN_COOKIE, { path: "/api/auth" });
}

/**
 * Helper: extract refresh token from cookie or request body.
 */
export function extractRefreshToken(req: Request): string | null {
  return req.cookies?.[REFRESH_TOKEN_COOKIE] || req.body?.refreshToken || null;
}

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and session management
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user account
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Arjun Tapriya
 *               email:
 *                 type: string
 *                 format: email
 *                 example: arjun@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass1!
 *     responses:
 *       201:
 *         description: Account created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already exists
 */
authRouter.post(
  "/signup",
  authRateLimiter,
  validate(signupSchema),
  asyncHandler(authController.signup)
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate an existing user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful — sets httpOnly refresh token cookie
 *       401:
 *         description: Invalid credentials
 */
authRouter.post(
  "/login",
  authRateLimiter,
  validate(loginSchema),
  asyncHandler(authController.login)
);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get the authenticated user's profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
authRouter.get("/profile", authenticate, asyncHandler(authController.profile));

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Rotate refresh token and issue new access token
 *     tags: [Auth]
 *     security: []
 *     description: >
 *       Reads the refresh token from the httpOnly cookie `rft` (or from `refreshToken`
 *       field in request body as fallback). Issues a new access token and rotates the
 *       refresh token (old token is immediately revoked).
 *     responses:
 *       200:
 *         description: New access token issued
 *       401:
 *         description: Refresh token missing, expired, or revoked
 */
authRouter.post(
  "/refresh",
  authRateLimiter,
  asyncHandler(authController.refresh)
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout from current device (revoke refresh token)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
authRouter.post("/logout", authenticate, asyncHandler(authController.logout));

/**
 * @swagger
 * /auth/logout-all:
 *   post:
 *     summary: Logout from all devices (revoke all refresh tokens)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All sessions revoked
 */
authRouter.post("/logout-all", authenticate, asyncHandler(authController.logoutAll));

export { authRouter };
