import { User, Subscription } from "@prisma/client";
import { prisma } from "../../config/database";
import { UpdateUserData } from "./users.dto";

type UserWithSubscription = User & { subscription?: Subscription | null };

/**
 * Data-access layer for the users module.
 * All queries are isolated here so the service layer stays free of Prisma imports.
 */
export class UsersRepository {
  /**
   * Find a user by primary key, including their subscription record.
   * Returns null when the user does not exist.
   */
  async findById(id: string): Promise<UserWithSubscription | null> {
    return prisma.user.findUnique({
      where: { id },
      include: { subscriptions: true },
    });
  }

  /**
   * Apply a partial update to the user's profile fields.
   *
   * Security enforced at this layer:
   *  - Only the fields listed in UpdateUserData can be mutated.
   *  - email, password, createdAt, and subscription are never touched here.
   *  - updatedAt is managed automatically by Prisma (@updatedAt).
   */
  async updateProfile(
    id: string,
    data: UpdateUserData
  ): Promise<UserWithSubscription> {
    return prisma.user.update({
      where: { id },
      data,
      include: { subscriptions: true },
    });
  }
  async pingStreak(id: string): Promise<UserWithSubscription> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error("User not found");

    const now = new Date();
    const lastActive = user.lastActiveDate;

    let newStreak = user.streakCount;
    if (!lastActive) {
      newStreak = 1;
    } else {
      const lastActiveDay = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const diffTime = Math.abs(today.getTime() - lastActiveDay.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
      // If diffDays === 0, it means they already pinged today, so streak stays the same
    }

    return prisma.user.update({
      where: { id },
      data: {
        streakCount: newStreak,
        lastActiveDate: now,
      },
      include: { subscriptions: true },
    });
  }

  async toggleManualQuestion(id: string, questionId: string, completed: boolean): Promise<UserWithSubscription> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error("User not found");

    let updatedQuestions = [...user.manualCompletedQuestions];
    if (completed) {
      if (!updatedQuestions.includes(questionId)) {
        updatedQuestions.push(questionId);
      }
    } else {
      updatedQuestions = updatedQuestions.filter(qId => qId !== questionId);
    }

    return prisma.user.update({
      where: { id },
      data: { manualCompletedQuestions: updatedQuestions },
      include: { subscriptions: true },
    });
  }
}

export const usersRepository = new UsersRepository();
