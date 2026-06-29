import { describe, it, expect, vi, beforeEach } from "vitest";
import { authService } from "./auth.service";
import { usersRepository } from "../users/users.repository";
import { authRefreshRepository } from "./auth.refresh.repository";
import { UnauthorizedError } from "../../utils/AppError";

vi.mock("../users/users.repository", () => ({
  usersRepository: {
    findById: vi.fn(),
  },
}));

vi.mock("./auth.refresh.repository", () => ({
  authRefreshRepository: {
    findValidToken: vi.fn(),
    revokeToken: vi.fn(),
    revokeAllForUser: vi.fn(),
    createToken: vi.fn(),
  },
}));

// Mock process.env
vi.mock("../../config/env", () => ({
  env: {
    JWT_SECRET: "test-secret",
    JWT_EXPIRES_IN: "15m",
    JWT_ALGORITHM: "HS256",
    REFRESH_TOKEN_EXPIRES_IN: "7d",
  },
}));

describe("AuthService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("refreshTokens", () => {
    it("should throw UnauthorizedError if token validation fails", async () => {
      vi.mocked(authRefreshRepository.findValidToken).mockResolvedValueOnce(null);

      await expect(authService.refreshTokens("invalid-token")).rejects.toThrow("Invalid or expired refresh token");
      expect(authRefreshRepository.findValidToken).toHaveBeenCalledWith("invalid-token");
    });

    it("should issue new access and refresh tokens", async () => {
      const mockUser = {
        id: "user-1",
        email: "test@test.com",
        name: "Test User",
        role: "USER",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(authRefreshRepository.findValidToken).mockResolvedValueOnce({
        id: "rt-1",
        userId: "user-1",
        user: mockUser,
        expiresAt: new Date(Date.now() + 100000),
      } as any);
      vi.mocked(authRefreshRepository.revokeToken).mockResolvedValueOnce(undefined as any);
      vi.mocked(authRefreshRepository.createToken).mockResolvedValueOnce("new-refresh-token" as any);

      const result = await authService.refreshTokens("valid-token");

      expect(result).toHaveProperty("token");
      expect(result).toHaveProperty("refreshToken");
      expect(result.refreshToken).toBe("new-refresh-token");
      expect(authRefreshRepository.revokeToken).toHaveBeenCalledWith("valid-token");
      expect(authRefreshRepository.createToken).toHaveBeenCalledWith(
        mockUser.id,
        expect.any(Date)
      );
    });
  });

  describe("logout", () => {
    it("should revoke the specific token", async () => {
      vi.mocked(authRefreshRepository.revokeToken).mockResolvedValueOnce(undefined as any);

      await authService.logout("valid-token");

      expect(authRefreshRepository.revokeToken).toHaveBeenCalledWith("valid-token");
    });
  });

  describe("logoutAll", () => {
    it("should revoke all tokens for a user", async () => {
      vi.mocked(authRefreshRepository.revokeAllForUser).mockResolvedValueOnce(undefined as any);

      await authService.logoutAll("user-1");

      expect(authRefreshRepository.revokeAllForUser).toHaveBeenCalledWith("user-1");
    });
  });
});
