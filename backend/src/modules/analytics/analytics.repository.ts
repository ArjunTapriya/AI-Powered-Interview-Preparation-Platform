import { EvaluationReport, InterviewSession, ActivityLog } from "@prisma/client";
import { prisma } from "../../config/database";

export class AnalyticsRepository {
  /**
   * Fetch all interview sessions for a user, ordered by date descending
   */
  async getUserSessions(userId: string): Promise<InterviewSession[]> {
    return prisma.interviewSession.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Fetch all evaluation reports for a user, ordered by creation date descending
   */
  async getUserEvaluations(userId: string): Promise<(EvaluationReport & { interviewSession: InterviewSession })[]> {
    return prisma.evaluationReport.findMany({
      where: {
        interviewSession: {
          userId: userId,
        },
      },
      include: {
        interviewSession: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }
  
  async getUserQuestionAttempts(userId: string) {
    return prisma.questionAttemptHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getSuccessfulCodeSubmissions(userId: string) {
    return prisma.codeSubmission.findMany({
      where: { 
        userId,
        status: "ACCEPTED"
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async upsertActivity(userId: string, date: string, durationSeconds: number): Promise<ActivityLog> {
    return prisma.activityLog.upsert({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
      update: {
        durationSeconds: {
          increment: durationSeconds,
        },
      },
      create: {
        userId,
        date,
        durationSeconds,
      },
    });
  }

  async getWeeklyActivity(userId: string, dateStrings: string[]): Promise<ActivityLog[]> {
    return prisma.activityLog.findMany({
      where: {
        userId,
        date: {
          in: dateStrings,
        },
      },
    });
  }
}

export const analyticsRepository = new AnalyticsRepository();
