import { Request, Response } from "express";
import { authService } from "./auth.service";
import { sendSuccess } from "../../utils/apiResponse";
import { LoginInput, SignupInput } from "./auth.validation";
import { UnauthorizedError } from "../../utils/AppError";
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  extractRefreshToken,
} from "./auth.routes";

export class AuthController {
  signup = async (req: Request, res: Response): Promise<void> => {
    const body = req.body as SignupInput;
    const result = await authService.signup(body);
    const { refreshToken, ...responseData } = result;
    setRefreshTokenCookie(res, refreshToken);
    sendSuccess(res, { ...responseData, refreshToken }, "Account created successfully", 201);
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const body = req.body as LoginInput;
    const result = await authService.login(body);
    const { refreshToken, ...responseData } = result;
    setRefreshTokenCookie(res, refreshToken);
    sendSuccess(res, { ...responseData, refreshToken }, "Login successful");
  };

  profile = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.userId) {
      throw new UnauthorizedError("Access token is required");
    }

    const user = await authService.getProfile(req.user.userId);
    sendSuccess(res, { user }, "Profile retrieved successfully");
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    const rawToken = extractRefreshToken(req);
    if (!rawToken) {
      throw new UnauthorizedError("Refresh token is required");
    }

    const result = await authService.refreshTokens(rawToken);
    const { refreshToken, ...responseData } = result;
    setRefreshTokenCookie(res, refreshToken);
    sendSuccess(res, { ...responseData, refreshToken }, "Token refreshed successfully");
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    const rawToken = extractRefreshToken(req);
    if (rawToken) {
      await authService.logout(rawToken);
    }
    clearRefreshTokenCookie(res);
    sendSuccess(res, null, "Logged out successfully");
  };

  logoutAll = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.userId) {
      throw new UnauthorizedError("Access token is required");
    }
    await authService.logoutAll(req.user.userId);
    clearRefreshTokenCookie(res);
    sendSuccess(res, null, "All sessions revoked");
  };
}

export const authController = new AuthController();
