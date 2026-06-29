import { Request, Response } from "express";
import { questionGenerationService } from "./question-generation.service";
import { sendSuccess } from "../../utils/apiResponse";
import { NotFoundError, AppError } from "../../utils/AppError";

export class QuestionGenerationController {
  generate = async (req: Request, res: Response): Promise<void> => {
    const { topic, difficulty, type } = req.body;
    const userId = (req as any).user?.id || (req as any).user?.userId;

    if (!topic || !difficulty) {
      throw new AppError("topic and difficulty are required", 400);
    }

    const questionId = await questionGenerationService.generateAndPersist(
      topic,
      difficulty as "Easy" | "Medium" | "Hard",
      (type as any) || "DSA",
      userId
    );

    sendSuccess(res, { questionId }, "Question generated and saved successfully", 201);
  };

  bulkGenerate = async (req: Request, res: Response): Promise<void> => {
    const { topic, difficulty, type, count } = req.body;
    const userId = (req as any).user?.id || (req as any).user?.userId;

    if (!topic || !difficulty || !count) {
      throw new AppError("topic, difficulty, and count are required", 400);
    }

    if (count > 20) {
      throw new AppError("Maximum 20 questions per bulk request", 400);
    }

    const jobId = await questionGenerationService.bulkGenerate(
      (type as any) || "DSA",
      topic,
      difficulty as "Easy" | "Medium" | "Hard",
      Number(count),
      userId
    );

    sendSuccess(res, { jobId }, "Bulk generation job started", 202);
  };

  getJobStatus = async (req: Request, res: Response): Promise<void> => {
    const jobId = req.params.jobId as string;
    const job = await questionGenerationService.getJobStatus(jobId);

    if (!job) {
      throw new NotFoundError("Generation job not found");
    }

    sendSuccess(res, { job }, "Job status retrieved");
  };
}

export const questionGenerationController = new QuestionGenerationController();
