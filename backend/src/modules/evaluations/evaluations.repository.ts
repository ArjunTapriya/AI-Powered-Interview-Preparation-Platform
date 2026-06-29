import { EvaluationReport, InterviewSession } from "@prisma/client";
import { prisma } from "../../config/database";
import { CreateEvaluationInput } from "./evaluations.validation";

export class EvaluationsRepository {
  /**
   * Creates an evaluation report linked to an interview session
   */
  async createReport(data: CreateEvaluationInput): Promise<EvaluationReport> {
    return prisma.evaluationReport.create({
      data: {
        interviewSessionId: data.sessionId,
        correctness: data.correctness,
        speed: data.speed,
        architecture: data.architecture,
        communication: data.communication,
        feedback: data.feedback,
        score: Math.round(
          ((data.correctness || 0) + (data.speed || 0) + (data.architecture || 0) + (data.communication || 0)) / 4
        ),
        strengths: data.strengths ? data.strengths : [],
        weaknesses: data.weaknesses ? data.weaknesses : [],
        recommendations: data.recommendations ? data.recommendations : [],
      },
    });
  }

  /**
   * Fetch a report directly by its ID
   */
  async getReportById(id: string): Promise<(EvaluationReport & { interviewSession: InterviewSession }) | null> {
    return prisma.evaluationReport.findUnique({
      where: { id },
      include: {
        interviewSession: true,
      },
    });
  }

  /**
   * Fetch a report by its Session ID
   */
  async getReportBySessionId(sessionId: string): Promise<(EvaluationReport & { interviewSession: InterviewSession }) | null> {
    return prisma.evaluationReport.findUnique({
      where: { interviewSessionId: sessionId },
      include: {
        interviewSession: true,
      },
    });
  }
}

export const evaluationsRepository = new EvaluationsRepository();
