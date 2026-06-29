import { Router } from "express";
import multer from "multer";
import { resumeController } from "./resume.controller";
import { authenticate } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";

const resumesRouter = Router();

// Use memory storage so we can read the buffer directly in the service
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed."));
    }
  },
});

/**
 * @swagger
 * tags:
 *   name: Resume Intelligence
 *   description: Resume upload, PDF parsing, and AI-powered analysis
 */

/**
 * @swagger
 * /resumes/upload:
 *   post:
 *     summary: Upload and analyze a resume PDF
 *     description: Accepts a PDF file, extracts text, and uses Gemini AI to parse skills, experience, education, projects, and generate a match score.
 *     tags: [Resume Intelligence]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - resume
 *             properties:
 *               resume:
 *                 type: string
 *                 format: binary
 *               targetRole:
 *                 type: string
 *                 description: Optional target role for match scoring
 *     responses:
 *       201:
 *         description: Resume uploaded and analyzed successfully
 *       400:
 *         description: Invalid file or no file uploaded
 *       401:
 *         description: Unauthorized
 */
resumesRouter.post(
  "/upload",
  authenticate,
  upload.single("resume"),
  asyncHandler(resumeController.upload)
);

/**
 * @swagger
 * /resumes/parse-temporary:
 *   post:
 *     summary: Parse a resume without saving to DB
 *     tags: [Resume Intelligence]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - resume
 *             properties:
 *               resume:
 *                 type: string
 *                 format: binary
 *               targetRole:
 *                 type: string
 */
resumesRouter.post(
  "/parse-temporary",
  authenticate,
  upload.single("resume"),
  asyncHandler(resumeController.parseTemporary)
);

/**
 * @swagger
 * /resumes/me:
 *   get:
 *     summary: Get current user's parsed resume
 *     tags: [Resume Intelligence]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resume data retrieved
 *       404:
 *         description: No resume found
 */
resumesRouter.get("/me", authenticate, asyncHandler(resumeController.getMyResume));

/**
 * @swagger
 * /resumes/reanalyze:
 *   post:
 *     summary: Re-run AI analysis on existing resume
 *     description: Re-analyzes the previously uploaded resume text without needing to re-upload the file.
 *     tags: [Resume Intelligence]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetRole:
 *                 type: string
 *     responses:
 *       200:
 *         description: Resume re-analyzed successfully
 *       404:
 *         description: No resume found
 */
resumesRouter.post("/reanalyze", authenticate, asyncHandler(resumeController.reanalyze));

export { resumesRouter };
