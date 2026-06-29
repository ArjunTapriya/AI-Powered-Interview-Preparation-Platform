import { prisma } from "../../config/database";
import { SubscriptionPlan, SubscriptionStatus, User } from "@prisma/client";

export interface CreateUserRecord {
  name: string;
  email: string;
  passwordHash: string;
}

export class AuthRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: { subscriptions: true },
    });
  }

  async createUser(input: CreateUserRecord): Promise<User> {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: input.passwordHash,
        },
      });

      await tx.subscription.create({
        data: {
          userId: user.id,
          plan: SubscriptionPlan.FREE,
          status: SubscriptionStatus.ACTIVE,
        },
      });

      return user;
    });
  }
}

export const authRepository = new AuthRepository();
