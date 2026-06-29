import crypto from "crypto";
import { prisma } from "../../config/database";

const REFRESH_TOKEN_BYTES = 64;

function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export const authRefreshRepository = {
  /**
   * Creates a new hashed refresh token for a user.
   * Returns the raw (unhashed) token — only sent once to the client.
   */
  async createToken(userId: string, expiresAt: Date): Promise<string> {
    const rawToken = crypto.randomBytes(REFRESH_TOKEN_BYTES).toString("hex");
    const tokenHash = hashToken(rawToken);

    await prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });

    return rawToken;
  },

  /**
   * Looks up a refresh token by its raw value.
   * Returns null if not found, expired, or revoked.
   */
  async findValidToken(rawToken: string) {
    const tokenHash = hashToken(rawToken);
    const record = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!record) return null;
    if (record.revokedAt) return null;
    if (record.expiresAt < new Date()) return null;

    return record;
  },

  /**
   * Revokes a single refresh token (logout).
   */
  async revokeToken(rawToken: string): Promise<void> {
    const tokenHash = hashToken(rawToken);
    await prisma.refreshToken
      .update({ where: { tokenHash }, data: { revokedAt: new Date() } })
      .catch(() => {
        /* token may not exist — silently ignore */
      });
  },

  /**
   * Revokes ALL active refresh tokens for a user (logout-all / password change).
   */
  async revokeAllForUser(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  /**
   * Cleans up expired tokens (run periodically — can be called from a cron job).
   */
  async deleteExpiredTokens(): Promise<number> {
    const result = await prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    return result.count;
  },
};
