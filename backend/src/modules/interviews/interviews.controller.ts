import { Request, Response } from "express";
import { interviewsService } from "./interviews.service";
import { sendSuccess } from "../../utils/apiResponse";
import { CreateInterviewInput } from "./interviews.validation";
import { UnauthorizedError } from "../../utils/AppError";

export class InterviewsController {
  /**
   * POST /api/interviews
   */
  create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.userId) {
      throw new UnauthorizedError("Access token is required");
    }

    const body = req.body as CreateInterviewInput;
    const session = await interviewsService.createSession(req.user.userId, body);
    
    sendSuccess(res, { session }, "Interview session created successfully", 201);
  };

  /**
   * GET /api/interviews
   */
  getAll = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.userId) {
      throw new UnauthorizedError("Access token is required");
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const data = await interviewsService.getUserSessions(req.user.userId, page, limit);
    
    sendSuccess(res, data, "Sessions retrieved successfully");
  };

  /**
   * GET /api/interviews/:id
   */
  getById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.userId) {
      throw new UnauthorizedError("Access token is required");
    }

    const session = await interviewsService.getSessionById(req.user.userId, req.params.id as string);
    
    sendSuccess(res, { session }, "Session retrieved successfully");
  };

  /**
   * DELETE /api/interviews/:id
   */
  delete = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.userId) {
      throw new UnauthorizedError("Access token is required");
    }

    await interviewsService.deleteSession(req.user.userId, req.params.id as string);
    
    sendSuccess(res, null, "Session deleted successfully");
  };

  /**
   * GET /api/interviews/:id/report
   */
  getReport = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.userId) {
      throw new UnauthorizedError("Access token is required");
    }

    const session = await interviewsService.getSessionById(req.user.userId, req.params.id as string);
    
    // In our architecture, session already includes `evaluationReport` metrics in the DTO,
    // but the actual detailed evaluation report with strengths/weaknesses isn't included in the Interview DTO.
    // However, the frontend requested a convenience endpoint that returns both.
    // For simplicity, we just return the session DTO here since it already handles mapping the report.
    // To be perfectly compliant with the prompt's request for full report details (strengths/weaknesses),
    // we would import `evaluationsService.getReportBySessionId`.
    
    // Let's import `evaluationsRepository` dynamically to avoid circular dependencies in services.
    const { evaluationsRepository } = require("../evaluations/evaluations.repository");
    const reportRaw = await evaluationsRepository.getReportBySessionId(req.params.id as string);
    
    sendSuccess(res, { session, report: reportRaw }, "Session report retrieved successfully");
  };
}

export const interviewsController = new InterviewsController();
