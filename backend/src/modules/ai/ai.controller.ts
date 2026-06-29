import { Request, Response } from "express";
import { aiService } from "./ai.service";
import { sendSuccess } from "../../utils/apiResponse";
import { UnauthorizedError, ValidationError, NotFoundError, ForbiddenError } from "../../utils/AppError";
import { prisma } from "../../config/database";

export class AIController {
  /**
   * POST /api/ai/evaluate
   * Executes AI evaluation for an interview session submission.
   */
  evaluate = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.userId) {
      throw new UnauthorizedError("Authentication token is required");
    }

    const { sessionId, questionId, answer, code, executionResults } = req.body;
    if (!sessionId || !questionId) {
      throw new ValidationError("sessionId and questionId are required fields.");
    }

    const result = await aiService.evaluateSession(req.user.userId, {
      sessionId,
      questionId,
      answer,
      code,
      executionResults,
    });

    sendSuccess(res, result, "AI evaluation completed successfully");
  };

  /**
   * POST /api/ai/re-evaluate
   * Re-evaluates an existing session, fetching existing code/transcripts from DB.
   */
  reEvaluate = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.userId) {
      throw new UnauthorizedError("Authentication token is required");
    }

    const { sessionId, questionId } = req.body;
    if (!sessionId || !questionId) {
      throw new ValidationError("sessionId and questionId are required fields for re-evaluation.");
    }

    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundError("Interview session not found");
    }

    if (session.userId !== req.user.userId) {
      throw new ForbiddenError("You do not own this session");
    }

    // Execute evaluation, pulling text outlines/transcripts directly from PostgreSQL
    const result = await aiService.evaluateSession(req.user.userId, {
      sessionId,
      questionId,
      code: session.codeSnippet || undefined,
      answer: session.transcript ? (session.transcript as any) : undefined,
      executionResults: {},
    });

    sendSuccess(res, result, "Re-evaluation completed successfully");
  };

  /**
   * POST /api/ai/resume-intelligence
   * Generates a deep Resume Intelligence Report
   */
  generateResumeReport = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.userId) {
      throw new UnauthorizedError("Authentication token is required");
    }

    const { resumeText, targetRole, targetCompany, experienceLevel, jobDescription } = req.body;
    
    if (!resumeText) {
      throw new ValidationError("resumeText is required.");
    }

    const report = await aiService.generateResumeIntelligenceReport(
      resumeText,
      targetRole || "Software Engineer",
      targetCompany || "Technology Company",
      experienceLevel || "Mid-Level",
      jobDescription || ""
    );

    sendSuccess(res, report, "Resume intelligence report generated successfully");
  };

  /**
   * POST /api/ai/evaluate-single-answer
   * Dynamically evaluates a single answer against resume context.
   */
  evaluateSingleAnswer = async (req: Request, res: Response): Promise<void> => {
    // We allow this without user.userId if it's practice mode, but normally we check it.
    const { question, answer, resumeText, roleLevel, usedVoice } = req.body;
    
    if (!question || !answer) {
      throw new ValidationError("question and answer are required.");
    }

    const evaluation = await aiService.evaluateSingleAnswer(
      question,
      answer,
      resumeText || "Candidate",
      roleLevel || "Mid",
      usedVoice || false
    );

    sendSuccess(res, evaluation, "Answer evaluated successfully");
  };

  /**
   * POST /api/ai/generate-final-report
   * Generates a final analysis report based on session logs.
   */
  generateFinalReport = async (req: Request, res: Response): Promise<void> => {
    const { sessionLogs, roleLevel } = req.body;
    
    if (!sessionLogs || !Array.isArray(sessionLogs)) {
      throw new ValidationError("sessionLogs array is required.");
    }

    const reportMarkdown = await aiService.generateFinalAnalysisReport(sessionLogs, roleLevel || "Mid");

    sendSuccess(res, { reportMarkdown }, "Final report generated successfully");
  };

  /**
   * GET /api/ai/prep-guide/:category
   */
  getPrepGuide = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.userId) throw new UnauthorizedError("Authentication token is required");
    
    const category = req.params.category as string;
    const prepGuide = await prisma.prepGuide.findUnique({
      where: { userId_category: { userId: req.user.userId, category } }
    });
    
    if (!prepGuide) {
      sendSuccess(res, { prepSteps: null, completedIndices: [], historyCount: 0 }, "No prep guide found");
      return;
    }

    let parsedCompleted = [];
    try {
      parsedCompleted = typeof prepGuide.completedIndices === "string" 
        ? JSON.parse(prepGuide.completedIndices) 
        : prepGuide.completedIndices || [];
    } catch (e) {}

    sendSuccess(res, { 
      prepSteps: prepGuide.steps, 
      completedIndices: parsedCompleted,
      historyCount: prepGuide.historyCount 
    }, "Prep guide retrieved");
  };

  /**
   * PUT /api/ai/prep-guide/:category/progress
   */
  updatePrepGuideProgress = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.userId) throw new UnauthorizedError("Authentication token is required");
    
    const category = req.params.category as string;
    const { completedIndices } = req.body;

    await prisma.prepGuide.update({
      where: { userId_category: { userId: req.user.userId, category } },
      data: { completedIndices: JSON.stringify(completedIndices) }
    });

    sendSuccess(res, { completedIndices }, "Prep guide progress updated");
  };

  /**
   * POST /api/ai/prep-guide
   * Generates a 10-step preparation guide based on history.
   */
  generatePrepGuide = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.userId) throw new UnauthorizedError("Authentication token is required");
    const { history, category } = req.body;
    
    if (!history || !Array.isArray(history)) {
      throw new ValidationError("history array is required.");
    }

    const userId = req.user.userId;
    const cat = category || "Technical";
    
    const existingGuide = await prisma.prepGuide.findUnique({
      where: { userId_category: { userId, category: cat } }
    });

    let existingSteps = undefined;
    let existingCompleted = undefined;

    if (existingGuide && Array.isArray(existingGuide.steps)) {
        existingSteps = existingGuide.steps;
        try {
          existingCompleted = typeof existingGuide.completedIndices === "string" 
              ? JSON.parse(existingGuide.completedIndices) 
              : existingGuide.completedIndices;
        } catch(e) {
          existingCompleted = [];
        }
    }

    const prepSteps = await aiService.generate10StepPrepGuide(
      history, 
      cat,
      existingSteps as string[] | undefined,
      existingCompleted
    );

    await prisma.prepGuide.upsert({
      where: { userId_category: { userId, category: cat } },
      update: { 
        steps: prepSteps,
        historyCount: history.length,
      },
      create: {
        userId,
        category: cat,
        steps: prepSteps,
        historyCount: history.length,
        completedIndices: "[]"
      }
    });

    sendSuccess(res, { prepSteps }, "Prep guide generated successfully");
  };
}

export const aiController = new AIController();
