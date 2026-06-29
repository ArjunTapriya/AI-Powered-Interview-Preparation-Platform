import { Request, Response } from "express";
import { usersService } from "./users.service";
import { sendSuccess } from "../../utils/apiResponse";
import { UpdateUserInput } from "./users.validation";
import { UnauthorizedError } from "../../utils/AppError";

export class UsersController {
  /**
   * GET /api/users/me
   *
   * Returns the authenticated user's profile in the UserProfileDto shape,
   * which the React frontend can use directly to hydrate AppContext.user.
   */
  getMe = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.userId) {
      throw new UnauthorizedError("Access token is required");
    }

    const user = await usersService.getCurrentUser(req.user.userId);
    sendSuccess(res, { user }, "Profile retrieved successfully");
  };

  /**
   * PUT /api/users/me
   *
   * Partially updates the authenticated user's profile.
   * Only the fields present in the validated body are written.
   * Returns the full updated profile so the frontend can
   * replace its local state in one round-trip.
   */
  updateMe = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.userId) {
      throw new UnauthorizedError("Access token is required");
    }

    const body = req.body as UpdateUserInput;
    const user = await usersService.updateCurrentUser(req.user.userId, body);
    sendSuccess(res, { user }, "Profile updated successfully");
  };

  pingStreak = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.userId) {
      throw new UnauthorizedError("Access token is required");
    }

    const user = await usersService.pingStreak(req.user.userId);
    sendSuccess(res, { user }, "Streak updated successfully");
  };

  toggleManualQuestion = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.userId) {
      throw new UnauthorizedError("Access token is required");
    }

    const { questionId, completed } = req.body;
    if (typeof questionId !== "string" || typeof completed !== "boolean") {
      res.status(400).json({ success: false, message: "Invalid payload" });
      return;
    }

    const user = await usersService.toggleManualQuestion(req.user.userId, questionId, completed);
    sendSuccess(res, { user }, "Manual question tracked successfully");
  };
}

export const usersController = new UsersController();
