import { Router } from "express";
import { usersController } from "./users.controller";
import { updateUserSchema } from "./users.validation";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";

const usersRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Authenticated user profile management
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get the authenticated user's profile
 *     description: >
 *       Returns the full user profile in the UserProfile shape expected by
 *       the React frontend (AppContext.tsx). Call this after login to hydrate
 *       the user state from the database instead of localStorage.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/UserProfile'
 *             example:
 *               success: true
 *               message: "Profile retrieved successfully"
 *               data:
 *                 user:
 *                   id: "550e8400-e29b-41d4-a716-446655440000"
 *                   name: "Arjun Tapriya"
 *                   email: "arjun@example.com"
 *                   isLoggedIn: true
 *                   targetCompany: "Google"
 *                   roleDepth: "Senior"
 *                   prepWeeks: 6
 *                   diagnosticCompleted: false
 *                   radarScores:
 *                     correctness: 0
 *                     speed: 0
 *                     architecture: 0
 *                     communication: 0
 *                   createdAt: "2026-06-18T10:00:00.000Z"
 *                   updatedAt: "2026-06-18T10:00:00.000Z"
 *       401:
 *         description: Missing or invalid JWT
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
usersRouter.get("/me", authenticate, asyncHandler(usersController.getMe));

/**
 * @swagger
 * /users/me:
 *   put:
 *     summary: Update the authenticated user's profile
 *     description: >
 *       Partially updates the user profile. Only send the fields you want
 *       to change — all others remain unchanged.
 *
 *       **Immutable fields (ignored if sent):** email, password, subscription,
 *       createdAt, updatedAt. These are stripped before the database write.
 *
 *       **Frontend usage:**
 *       - OnboardingFlow Step 1: send `targetCompany`, `roleDepth`, `prepWeeks`
 *       - OnboardingFlow Step 3/Skip: send `diagnosticCompleted: true`
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: "Arjun Tapriya"
 *               targetCompany:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Google"
 *               roleDepth:
 *                 type: string
 *                 enum: [Junior, Mid-level, Senior, Staff/Principal]
 *                 example: "Senior"
 *               prepWeeks:
 *                 type: integer
 *                 minimum: 2
 *                 maximum: 24
 *                 example: 6
 *               diagnosticCompleted:
 *                 type: boolean
 *                 example: true
 *           examples:
 *             onboarding_step1:
 *               summary: "Onboarding Step 1 — career parameters"
 *               value:
 *                 targetCompany: "Google"
 *                 roleDepth: "Senior"
 *                 prepWeeks: 6
 *             onboarding_diagnostic:
 *               summary: "Onboarding Step 3 — mark diagnostic complete"
 *               value:
 *                 diagnosticCompleted: true
 *             update_name:
 *               summary: "Update name only"
 *               value:
 *                 name: "Arjun T."
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/UserProfile'
 *             example:
 *               success: true
 *               message: "Profile updated successfully"
 *               data:
 *                 user:
 *                   id: "550e8400-e29b-41d4-a716-446655440000"
 *                   name: "Arjun Tapriya"
 *                   email: "arjun@example.com"
 *                   isLoggedIn: true
 *                   targetCompany: "Google"
 *                   roleDepth: "Senior"
 *                   prepWeeks: 6
 *                   diagnosticCompleted: true
 *                   radarScores:
 *                     correctness: 0
 *                     speed: 0
 *                     architecture: 0
 *                     communication: 0
 *                   createdAt: "2026-06-18T10:00:00.000Z"
 *                   updatedAt: "2026-06-18T10:05:00.000Z"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Validation failed"
 *               data:
 *                 formErrors: []
 *                 fieldErrors:
 *                   roleDepth: ["roleDepth must be Junior, Mid-level, Senior, or Staff/Principal"]
 *                   prepWeeks: ["prepWeeks must be at least 2"]
 *       401:
 *         description: Missing or invalid JWT
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
usersRouter.put(
  "/me",
  authenticate,
  validate(updateUserSchema),
  asyncHandler(usersController.updateMe)
);

usersRouter.post(
  "/me/streak",
  authenticate,
  asyncHandler(usersController.pingStreak)
);

usersRouter.post(
  "/me/manual-questions",
  authenticate,
  asyncHandler(usersController.toggleManualQuestion)
);

export { usersRouter };
