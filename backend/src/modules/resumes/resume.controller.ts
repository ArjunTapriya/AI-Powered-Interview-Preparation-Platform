import { Request, Response } from "express";
import { resumeService } from "./resume.service";
import { sendSuccess, sendError } from "../../utils/apiResponse";

export const resumeController = {
  /**
   * POST /resumes/upload
   * Accepts multipart/form-data with a PDF file field named "resume".
   */
  async upload(req: Request, res: Response) {
    const userId = (req as any).user?.userId;
    const file = req.file;

    if (!file) {
      return sendError(res, "No file uploaded. Send a PDF file in the 'resume' field.", 400);
    }

    if (file.mimetype !== "application/pdf") {
      return sendError(res, "Only PDF files are accepted.", 400);
    }

    if (file.size > 10 * 1024 * 1024) {
      return sendError(res, "File too large. Maximum size is 10MB.", 400);
    }

    const targetRole = req.body.targetRole as string | undefined;
    const result = await resumeService.uploadResume(userId, file, targetRole);

    return sendSuccess(res, { resume: result }, "Resume uploaded and analyzed successfully.", 201);
  },

  /**
   * POST /resumes/parse-temporary
   * Accepts multipart/form-data with a PDF file field named "resume".
   * Returns analyzed resume without saving to DB.
   */
  async parseTemporary(req: Request, res: Response) {
    const userId = (req as any).user?.userId;
    const file = req.file;

    if (!file) {
      return sendError(res, "No file uploaded. Send a PDF file in the 'resume' field.", 400);
    }

    if (file.mimetype !== "application/pdf") {
      return sendError(res, "Only PDF files are accepted.", 400);
    }

    if (file.size > 10 * 1024 * 1024) {
      return sendError(res, "File too large. Maximum size is 10MB.", 400);
    }

    const targetRole = req.body.targetRole as string | undefined;
    const result = await resumeService.parseTemporary(userId, file, targetRole);

    return sendSuccess(res, { resume: result }, "Resume temporarily parsed and analyzed successfully.", 200);
  },

  /**
   * GET /resumes/me
   * Returns the current user's parsed resume data.
   */
  async getMyResume(req: Request, res: Response) {
    const userId = (req as any).user?.userId;
    const result = await resumeService.getResume(userId);
    return sendSuccess(res, { resume: result }, "Resume retrieved.");
  },

  /**
   * POST /resumes/reanalyze
   * Re-runs AI analysis on existing stored resume text.
   */
  async reanalyze(req: Request, res: Response) {
    const userId = (req as any).user?.userId;
    const targetRole = req.body.targetRole as string | undefined;
    const result = await resumeService.reanalyzeResume(userId, targetRole);
    return sendSuccess(res, { resume: result }, "Resume re-analyzed successfully.");
  },
};
