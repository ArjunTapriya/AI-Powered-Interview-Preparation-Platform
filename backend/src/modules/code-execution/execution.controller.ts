import { Request, Response } from "express";
import { executionService } from "./execution.service";
import { sendSuccess } from "../../utils/apiResponse";
import { UnauthorizedError } from "../../utils/AppError";
import { RunCodeSchemaInput, SubmitCodeSchemaInput, GetSubmissionsQueryInput } from "./execution.validation";

export class ExecutionController {
  /**
   * POST /api/code/run
   * Runs the code against custom inputs.
   */
  run = async (req: Request, res: Response): Promise<void> => {
    const { language, sourceCode, stdin } = req.body as RunCodeSchemaInput;
    const result = await executionService.runCode(language, sourceCode, stdin);
    sendSuccess(res, result, "Code executed successfully");
  };

  /**
   * POST /api/code/submit
   * Runs the code against all question test cases and logs results.
   */
  submit = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.userId) {
      throw new UnauthorizedError("Authentication token is required");
    }

    const questionId = req.params.questionId as string;
    const { language, sourceCode } = req.body as SubmitCodeSchemaInput;

    const result = await executionService.submitCode(
      req.user.userId,
      questionId,
      language,
      sourceCode
    );

    sendSuccess(res, result, "Submission completed successfully");
  };

  /**
   * GET /api/code/submissions
   * Fetches paginated history of code submissions for the logged in user.
   */
  getHistory = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.userId) {
      throw new UnauthorizedError("Authentication token is required");
    }

    const query = req.query as unknown as GetSubmissionsQueryInput;
    const result = await executionService.getSubmissionHistory(req.user.userId, query);
    
    sendSuccess(res, result, "Submission history retrieved successfully");
  };

  /**
   * GET /api/code/submissions/:id
   * Fetches detailed individual test cases for a specific submission.
   */
  getById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.userId) {
      throw new UnauthorizedError("Authentication token is required");
    }

    const result = await executionService.getSubmissionById(req.params.id as string, req.user.userId);
    sendSuccess(res, result, "Submission details retrieved successfully");
  };
}

export const executionController = new ExecutionController();
