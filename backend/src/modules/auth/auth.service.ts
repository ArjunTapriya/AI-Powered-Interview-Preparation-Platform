import bcrypt from "bcrypt";
import { User } from "@prisma/client";
import { authRepository } from "./auth.repository";
import { authRefreshRepository } from "./auth.refresh.repository";
import { AuthResponseDto, AuthUserDto, toAuthResponseDto, toAuthUserDto } from "./auth.dto";
import { LoginInput, SignupInput } from "./auth.validation";
import { signToken } from "../../middleware/auth";
import { env } from "../../config/env";
import { ConflictError, NotFoundError, UnauthorizedError } from "../../utils/AppError";
import { logger } from "../../utils/logger";

const BCRYPT_ROUNDS = 12;

/** Parse human-readable duration strings like "7d", "1h", "30m" → milliseconds */
function parseDurationMs(duration: string): number {
  const unit = duration.slice(-1);
  const value = parseInt(duration.slice(0, -1), 10);
  switch (unit) {
    case "d": return value * 24 * 60 * 60 * 1000;
    case "h": return value * 60 * 60 * 1000;
    case "m": return value * 60 * 1000;
    default: return 7 * 24 * 60 * 60 * 1000; // 7 days fallback
  }
}

export interface AuthWithRefreshResponseDto extends AuthResponseDto {
  refreshToken: string;
}

export class AuthService {
  async signup(input: SignupInput): Promise<AuthWithRefreshResponseDto> {
    const existingUser = await authRepository.findByEmail(input.email);

    if (existingUser) {
      throw new ConflictError("Email already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

    const user = await authRepository.createUser({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    return this.buildAuthResponse(user);
  }

  async login(input: LoginInput): Promise<AuthWithRefreshResponseDto> {
    const user = await authRepository.findByEmail(input.email);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const passwordMatches = await bcrypt.compare(input.password, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedError("Invalid credentials");
    }

    return this.buildAuthResponse(user);
  }

  async getProfile(userId: string): Promise<AuthUserDto> {
    const user = await authRepository.findById(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return toAuthUserDto(user);
  }

  /**
   * Rotate refresh token: validate old token → revoke → issue new access + refresh pair.
   */
  async refreshTokens(rawRefreshToken: string): Promise<AuthWithRefreshResponseDto> {
    const record = await authRefreshRepository.findValidToken(rawRefreshToken);

    if (!record) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    // Revoke the old refresh token (rotation)
    await authRefreshRepository.revokeToken(rawRefreshToken);

    // Issue a new pair
    return this.buildAuthResponse(record.user);
  }

  /**
   * Logout: revoke a single refresh token.
   */
  async logout(rawRefreshToken: string): Promise<void> {
    await authRefreshRepository.revokeToken(rawRefreshToken);
    logger.info("User refresh token revoked (logout)");
  }

  /**
   * Logout from all devices: revoke all tokens for a user.
   */
  async logoutAll(userId: string): Promise<void> {
    await authRefreshRepository.revokeAllForUser(userId);
    logger.info(`All refresh tokens revoked for user ${userId}`);
  }

  private async buildAuthResponse(user: User): Promise<AuthWithRefreshResponseDto> {
    const accessToken = signToken({ userId: user.id, email: user.email });

    const refreshExpiry = env.REFRESH_TOKEN_EXPIRES_IN;
    const expiresAt = new Date(Date.now() + parseDurationMs(refreshExpiry));
    const rawRefreshToken = await authRefreshRepository.createToken(user.id, expiresAt);

    return {
      ...toAuthResponseDto(user, accessToken, env.JWT_EXPIRES_IN),
      refreshToken: rawRefreshToken,
    };
  }
}

export const authService = new AuthService();
