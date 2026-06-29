import { EvaluationReport } from "@prisma/client";

export interface EvaluationReportDto {
  id: string;
  interviewSessionId: string;
  correctness: number | null;
  speed: number | null;
  architecture: number | null;
  communication: number | null;
  feedback: string | null;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
  createdAt: string;
}

/**
 * Maps the Prisma EvaluationReport model to a frontend-friendly DTO
 */
export function toEvaluationDto(report: EvaluationReport): EvaluationReportDto {
  return {
    id: report.id,
    interviewSessionId: report.interviewSessionId,
    correctness: report.correctness,
    speed: report.speed,
    architecture: report.architecture,
    communication: report.communication,
    feedback: report.feedback,
    strengths: report.strengths ? (report.strengths as string[]) : undefined,
    weaknesses: report.weaknesses ? (report.weaknesses as string[]) : undefined,
    recommendations: report.recommendations ? (report.recommendations as string[]) : undefined,
    createdAt: report.createdAt.toISOString(),
  };
}
