import { Request, Response } from "express";
import { questionsService } from "./questions.service";
import { sendSuccess } from "../../utils/apiResponse";
import { UnauthorizedError } from "../../utils/AppError";
import { GetQuestionsQuery, GetRandomQuestionQuery } from "./questions.validation";
import { aiService } from "../ai/ai.service";
import { questionGenerationService } from "../question-generation/question-generation.service";

export class QuestionsController {
  /**
   * GET /api/questions
   * Returns a paginated and filtered list of questions.
   */
  getQuestions = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as GetQuestionsQuery;
    const result = await questionsService.getQuestions(query);
    sendSuccess(res, result, "Questions retrieved successfully");
  };

  /**
   * GET /api/questions/random
   * Generates and returns a completely new random question matching query filters.
   */
  getRandom = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as GetRandomQuestionQuery;
    
    const difficulty = query.difficulty || "Medium";
    const category = query.category || "DSA";
    const topic = (query as any).tags?.length ? (query as any).tags[0] : (category === "DSA" ? "Arrays" : "System Design");
    
    // Dynamically generate a brand new question on the fly
    const newQuestionId = await questionGenerationService.generateAndPersist(
      topic,
      difficulty as any,
      category as any,
      req.user?.userId || "SYSTEM"
    );

    const question = await questionsService.getQuestionById(newQuestionId);
    sendSuccess(res, { question }, "Dynamic random question generated successfully");
  };

  /**
   * GET /api/questions/recommended
   * Returns an analytics-driven recommended question for the authenticated user.
   */
  getRecommended = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.userId) {
      throw new UnauthorizedError("Access token is required");
    }
    const question = await questionsService.getRecommendedQuestion(req.user.userId);
    sendSuccess(res, { question }, "Recommended question retrieved successfully");
  };

  /**
   * GET /api/questions/allocated-set
   * Returns the entire 101 allocated question set for the user.
   */
  getAllocatedSet = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.userId) {
      throw new UnauthorizedError("Access token is required");
    }
    const set = await questionsService.getAllocatedSet(req.user.userId);
    sendSuccess(res, { set }, "Allocated set retrieved successfully");
  };

  /**
   * GET /api/questions/sets
   * Returns all question sets without user-specific score analytics.
   */
  getSets = async (_req: Request, res: Response): Promise<void> => {
    const sets = await questionsService.getSets();
    sendSuccess(res, { sets }, "Sets retrieved successfully");
  };

  /**
   * POST /api/questions/generate-from-resume
   * Dynamically generate N interview questions based on resume text.
   */
  generateDynamicQuestions = async (req: Request, res: Response): Promise<void> => {
    const { resumeText, roleLevel, durationMin, category, difficulty } = req.body;
    const count = parseInt(durationMin, 10) || 5;

    const questions = await aiService.generateDynamicQuestions(resumeText || "Software Engineer", roleLevel || "Mid", count, category || "Technical", difficulty || "Medium");
    sendSuccess(res, { questions }, "Dynamic questions generated successfully");
  };

  /**
   * POST /api/questions/generate-mcq
   * Dynamically generate N MCQ questions based on resume text.
   */
  generateDynamicMCQ = async (req: Request, res: Response): Promise<void> => {
    const { resumeText, roleLevel, durationMin, category, difficulty } = req.body;
    const count = parseInt(durationMin, 10) || 5;

    const questions = await aiService.generateDynamicMCQQuestions(resumeText || "Software Engineer", roleLevel || "Mid", count, category || "Technical", difficulty || "Medium");
    sendSuccess(res, { questions }, "Dynamic MCQ questions generated successfully");
  };

  /**
   * GET /api/questions/:id
   * Returns detailed fields for a specific question.
   */
  getById = async (req: Request, res: Response): Promise<void> => {
    const question = await questionsService.getQuestionById(req.params.id as string);
    sendSuccess(res, { question }, "Question retrieved successfully");
  };
}

export const questionsController = new QuestionsController();
