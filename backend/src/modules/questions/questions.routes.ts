import { Router } from "express";
import { questionsController } from "./questions.controller";
import { getQuestionsQuerySchema, getRandomQuestionQuerySchema } from "./questions.validation";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";

const questionsRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Questions
 *   description: Question Bank management and recommendations
 */

/**
 * @swagger
 * /questions:
 *   get:
 *     summary: Retrieve question bank questions
 *     description: Returns a paginated list of interview questions. Supports extensive filtering.
 *     tags: [Questions]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Page limit (default 10)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query matching title or description
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [Easy, Medium, Hard]
 *         description: Difficulty level filter
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [DSA, System Design, Behavioral]
 *         description: Interview category filter
 *       - in: query
 *         name: topic
 *         schema:
 *           type: string
 *         description: Topic name filter (e.g. Arrays, Recursion)
 *       - in: query
 *         name: company
 *         schema:
 *           type: string
 *         description: Target company name filter (e.g. Google)
 *     responses:
 *       200:
 *         description: Questions list retrieved successfully
 *       400:
 *         description: Validation failed
 */
questionsRouter.get(
  "/",
  validate(getQuestionsQuerySchema, "query"),
  asyncHandler(questionsController.getQuestions)
);

/**
 * @swagger
 * /questions/random:
 *   get:
 *     summary: Get a random question
 *     description: Returns a single random question matching optional query parameters.
 *     tags: [Questions]
 *     parameters:
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [Easy, Medium, Hard]
 *         description: Filter difficulty level
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [DSA, System Design, Behavioral]
 *         description: Filter interview category
 *       - in: query
 *         name: topic
 *         schema:
 *           type: string
 *         description: Filter topic name
 *     responses:
 *       200:
 *         description: Random question retrieved successfully
 *       404:
 *         description: No question matched the filters
 */
questionsRouter.get(
  "/random",
  validate(getRandomQuestionQuerySchema, "query"),
  asyncHandler(questionsController.getRandom)
);

/**
 * @swagger
 * /questions/recommended:
 *   get:
 *     summary: Get analytics-driven recommended question
 *     description: Returns a personalized challenge recommendation based on the user's weaknesses and roadmap priorities.
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recommended question retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No questions available
 */
questionsRouter.get(
  "/recommended",
  authenticate,
  asyncHandler(questionsController.getRecommended)
);

/**
 * @swagger
 * /questions/allocated-set:
 *   get:
 *     summary: Retrieve allocated set of 101 questions
 *     description: Returns the user's allocated mock questions based on their profile score.
 *     tags: [Questions]
 *     responses:
 *       200:
 *         description: Allocated set retrieved successfully
 *       401:
 *         description: Unauthorized
 */
questionsRouter.get(
  "/allocated-set",
  authenticate,
  asyncHandler(questionsController.getAllocatedSet)
);

/**
 * @swagger
 * /questions/sets:
 *   get:
 *     summary: Retrieve all sets
 *     description: Returns the 3 sets unconditionally
 *     tags: [Questions]
 *     responses:
 *       200:
 *         description: Sets retrieved successfully
 */
questionsRouter.get(
  "/sets",
  authenticate,
  asyncHandler(questionsController.getSets)
);

/**
 * @swagger
 * /questions/generate-from-resume:
 *   post:
 *     summary: Generate dynamic questions from resume
 *     description: Uses Gemini API to generate N questions based on resume.
 *     tags: [Questions]
 */
questionsRouter.post(
  "/generate-from-resume",
  authenticate,
  asyncHandler(questionsController.generateDynamicQuestions)
);

/**
 * @swagger
 * /questions/generate-mcq:
 *   post:
 *     summary: Generate dynamic MCQ questions from resume
 *     description: Uses Gemini API to generate N MCQ questions based on resume.
 *     tags: [Questions]
 */
questionsRouter.post(
  "/generate-mcq",
  authenticate,
  asyncHandler(questionsController.generateDynamicMCQ)
);

/**
 * @swagger
 * /questions/{id}:
 *   get:
 *     summary: Get question details
 *     description: Returns complete details of a specific question by primary ID.
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique question UUID
 *     responses:
 *       200:
 *         description: Question retrieved successfully
 *       404:
 *         description: Question not found
 */
questionsRouter.get(
  "/:id",
  asyncHandler(questionsController.getById)
);

export { questionsRouter };
