import { evaluationsRepository } from "./evaluations.repository";
import { CreateEvaluationInput } from "./evaluations.validation";
import { EvaluationReportDto, toEvaluationDto } from "./evaluations.dto";
import { interviewsRepository } from "../interviews/interviews.repository";
import { NotFoundError, ForbiddenError, ValidationError } from "../../utils/AppError";

export class EvaluationsService {
  /**
   * Creates an evaluation report, ensuring the user owns the session
   */
  async createReport(userId: string, input: CreateEvaluationInput): Promise<EvaluationReportDto> {
    const session = await interviewsRepository.getSessionById(input.sessionId);

    if (!session) {
      throw new NotFoundError("Interview session not found");
    }

    if (session.userId !== userId) {
      throw new ForbiddenError("You do not own this session");
    }

    const existingReport = await evaluationsRepository.getReportBySessionId(input.sessionId);
    if (existingReport) {
      throw new ValidationError("Evaluation report already exists for this session");
    }

    const report = await evaluationsRepository.createReport(input);
    return toEvaluationDto(report);
  }

  /**
   * Retrieves an evaluation report by ID, ensuring the user owns the associated session
   */
  async getReportById(userId: string, reportId: string): Promise<EvaluationReportDto> {
    const report = await evaluationsRepository.getReportById(reportId);

    if (!report) {
      throw new NotFoundError("Evaluation report not found");
    }

    if (report.interviewSession.userId !== userId) {
      throw new ForbiddenError("You do not have permission to view this report");
    }

    return toEvaluationDto(report);
  }

  /**
   * Retrieves an evaluation report directly by Session ID
   */
  async getReportBySessionId(userId: string, sessionId: string): Promise<EvaluationReportDto> {
    const report = await evaluationsRepository.getReportBySessionId(sessionId);

    if (!report) {
      throw new NotFoundError("Evaluation report not found for this session");
    }

    if (report.interviewSession.userId !== userId) {
      throw new ForbiddenError("You do not have permission to view this report");
    }

    return toEvaluationDto(report);
  }
}

export const evaluationsService = new EvaluationsService();
