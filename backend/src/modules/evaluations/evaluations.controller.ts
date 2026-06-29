import { Request, Response } from "express";
import { evaluationsService } from "./evaluations.service";
import { sendSuccess } from "../../utils/apiResponse";
import { CreateEvaluationInput } from "./evaluations.validation";
import { UnauthorizedError } from "../../utils/AppError";

export class EvaluationsController {
  /**
   * POST /api/evaluations
   */
  create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.userId) {
      throw new UnauthorizedError("Access token is required");
    }

    const body = req.body as CreateEvaluationInput;
    const report = await evaluationsService.createReport(req.user.userId, body);

    sendSuccess(res, { report }, "Evaluation report created successfully", 201);
  };

  /**
   * GET /api/evaluations/:id
   */
  getById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.userId) {
      throw new UnauthorizedError("Access token is required");
    }

    const report = await evaluationsService.getReportById(req.user.userId, req.params.id as string);

    sendSuccess(res, { report }, "Evaluation report retrieved successfully");
  };
}

export const evaluationsController = new EvaluationsController();
