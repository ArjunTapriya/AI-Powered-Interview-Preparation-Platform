const pdfParse = require("pdf-parse");

import { resumeRepository } from "./resume.repository";
import { logger } from "../../utils/logger";
import { GeminiProvider } from "../ai/ai.providers/gemini.provider";
import { NotFoundError } from "../../utils/AppError";

interface ParsedResumeData {
  skills: { current: string[]; improvementScope: string };
  experience: { current: { title: string; company: string; duration: string; description: string }[]; improvementScope: string };
  education: { current: { degree: string; institution: string; year: string }[]; improvementScope: string };
  projects: { current: { name: string; description: string; tech: string[] }[]; improvementScope: string };
  aiSummary: string[];
  matchScore: number;
}

const RESUME_PARSE_SYSTEM_PROMPT = `You are an expert resume parser and career analyst.
Analyze the provided resume text against ideal industry standards for the target role.
Extract structured information AND provide actionable scope for improvement for each section.

Evaluate the resume on the following parameters to calculate a final resumeScore (0-100):
1. Skills Match
2. Experience Depth and Quality
3. Education Relevance
4. Project Impact

Return ONLY a raw JSON object (no markdown, no backticks) with this exact structure:
{
  "skills": {
    "current": ["skill1", "skill2"],
    "improvementScope": "Advice on missing skills..."
  },
  "experience": {
    "current": [
      { "title": "Job Title", "company": "Company Name", "duration": "Jan 2022 - Present", "description": "Key responsibilities and achievements" }
    ],
    "improvementScope": "Advice on improving experience bullets..."
  },
  "education": {
    "current": [
      { "degree": "B.Tech Computer Science", "institution": "University Name", "year": "2020" }
    ],
    "improvementScope": "Advice on highlighting coursework..."
  },
  "projects": {
    "current": [
      { "name": "Project Name", "description": "What it does", "tech": ["React", "Node.js"] }
    ],
    "improvementScope": "Advice on project impact..."
  },
  "aiSummary": [
    "Point 1 identifying the candidate...",
    "Point 2 giving an intro of their profile...",
    "Point 3 based on evaluation...",
    "Point 4...",
    "Point 5...",
    "Point 6..."
  ],
  "resumeScore": 75
}
Do not use the placeholder values, provide actual evaluated values.
resumeScore should be 0-100 estimating the candidate's overall readiness for the target role at a top tech company.`;

export class ResumeService {
  /**
   * Extract text from uploaded PDF buffer.
   */
  private async extractTextFromPdf(buffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(buffer);
      return data.text || "";
    } catch (err: any) {
      logger.error("PDF text extraction failed", { error: err.message });
      throw new Error(`Failed to parse PDF: ${err.message}`);
    }
  }

  /**
   * Retry with exponential backoff.
   */
  private async retryEvaluate(
    provider: GeminiProvider,
    systemPrompt: string,
    userPrompt: string,
    retries = 3,
    delay = 1000
  ): Promise<string> {
    try {
      return await provider.evaluate(systemPrompt, userPrompt);
    } catch (err: any) {
      if (retries <= 1) {
        throw err;
      }
      logger.warn(`AI Provider failed. Retrying in ${delay}ms...`, { error: err.message });
      await new Promise((resolve) => setTimeout(resolve, delay));
      return this.retryEvaluate(provider, systemPrompt, userPrompt, retries - 1, delay * 2);
    }
  }

  /**
   * Call Gemini AI to parse extracted resume text into structured data.
   */
  private async analyzeTextWithAI(text: string, targetRole?: string): Promise<ParsedResumeData> {
    const provider = new GeminiProvider();
    const userPrompt = `Parse the following resume and return the structured JSON:\n\n${text.slice(0, 8000)}\n\n${targetRole ? `Candidate's target role: ${targetRole}` : ""}`;

    let raw: string;
    try {
      raw = await this.retryEvaluate(provider, RESUME_PARSE_SYSTEM_PROMPT, userPrompt);
    } catch (err: any) {
      logger.error("AI resume analysis failed", { error: err.message });
      // Return safe defaults if AI fails
      return {
        skills: { current: [], improvementScope: "AI unavailable." },
        experience: { current: [], improvementScope: "AI unavailable." },
        education: { current: [], improvementScope: "AI unavailable." },
        projects: { current: [], improvementScope: "AI unavailable." },
        aiSummary: ["Resume uploaded.", "AI analysis currently unavailable."],
        matchScore: 50,
      };
    }

    try {
      const cleanJson = raw.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      return {
        skills: parsed.skills?.current ? parsed.skills : { current: Array.isArray(parsed.skills) ? parsed.skills : [], improvementScope: "No suggestions provided." },
        experience: parsed.experience?.current ? parsed.experience : { current: Array.isArray(parsed.experience) ? parsed.experience : [], improvementScope: "No suggestions provided." },
        education: parsed.education?.current ? parsed.education : { current: Array.isArray(parsed.education) ? parsed.education : [], improvementScope: "No suggestions provided." },
        projects: parsed.projects?.current ? parsed.projects : { current: Array.isArray(parsed.projects) ? parsed.projects : [], improvementScope: "No suggestions provided." },
        aiSummary: Array.isArray(parsed.aiSummary) ? parsed.aiSummary : [typeof parsed.aiSummary === "string" ? parsed.aiSummary : "No summary provided."],
        matchScore: Math.max(0, Math.min(100, Number(parsed.resumeScore || parsed.matchScore) || 50)),
      };
    } catch (err: any) {
      logger.error("Failed to parse AI resume response", { raw });
      return {
        skills: { current: [], improvementScope: "Failed to parse AI response." },
        experience: { current: [], improvementScope: "Failed to parse AI response." },
        education: { current: [], improvementScope: "Failed to parse AI response." },
        projects: { current: [], improvementScope: "Failed to parse AI response." },
        aiSummary: ["Resume uploaded successfully.", "Parsing failed."],
        matchScore: 50,
      };
    }
  }

  /**
   * Upload and process a resume PDF for a user.
   */
  async uploadResume(
    userId: string,
    file: Express.Multer.File,
    targetRole?: string
  ) {
    logger.info(`Processing resume upload for user ${userId}`);

    // Extract text from PDF
    const extractedText = await this.extractTextFromPdf(file.buffer);

    if (!extractedText.trim()) {
      throw new Error("Could not extract text from PDF. Ensure the PDF is not image-only.");
    }

    // AI analysis
    const parsed = await this.analyzeTextWithAI(extractedText, targetRole);

    // Persist to database
    const resume = await resumeRepository.upsert({
      userId,
      filename: file.filename || `resume-${userId}.pdf`,
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      extractedText,
      skills: parsed.skills,
      experience: parsed.experience,
      education: parsed.education,
      projects: parsed.projects,
      aiSummary: Array.isArray(parsed.aiSummary) ? parsed.aiSummary.join("\n") : parsed.aiSummary,
      matchScore: parsed.matchScore,
    });

    logger.info(`Resume processed for user ${userId}: Score=${parsed.matchScore}`);
    return this.formatResponse(resume);
  }

  /**
   * Upload and process a resume PDF for a user WITHOUT saving it to the database.
   * Useful for temporary interview practice contexts.
   */
  async parseTemporary(
    userId: string,
    file: Express.Multer.File,
    targetRole?: string
  ) {
    logger.info(`Processing temporary resume parse for user ${userId}`);

    const extractedText = await this.extractTextFromPdf(file.buffer);

    if (!extractedText.trim()) {
      throw new Error("Could not extract text from PDF. Ensure the PDF is not image-only.");
    }

    const parsed = await this.analyzeTextWithAI(extractedText, targetRole);

    return {
      id: "temporary",
      userId,
      filename: file.originalname,
      skills: parsed.skills,
      experience: parsed.experience,
      education: parsed.education,
      projects: parsed.projects,
      aiSummary: parsed.aiSummary,
      matchScore: parsed.matchScore,
      uploadedAt: new Date().toISOString()
    };
  }

  /**
   * Get the current resume for a user.
   */
  async getResume(userId: string) {
    const resume = await resumeRepository.findByUserId(userId);
    if (!resume) {
      throw new NotFoundError("No resume found. Please upload your resume.");
    }
    return this.formatResponse(resume);
  }

  /**
   * Re-run AI analysis on the existing stored resume text.
   */
  async reanalyzeResume(userId: string, targetRole?: string) {
    const resume = await resumeRepository.findByUserId(userId);
    if (!resume) {
      throw new NotFoundError("No resume found to re-analyze.");
    }

    const parsed = await this.analyzeTextWithAI(resume.extractedText, targetRole);

    const updated = await resumeRepository.upsert({
      userId,
      filename: resume.filename,
      originalName: resume.originalName,
      mimeType: resume.mimeType,
      fileSize: resume.fileSize,
      extractedText: resume.extractedText,
      skills: parsed.skills,
      experience: parsed.experience,
      education: parsed.education,
      projects: parsed.projects,
      aiSummary: Array.isArray(parsed.aiSummary) ? parsed.aiSummary.join("\n") : parsed.aiSummary,
      matchScore: parsed.matchScore,
    });

    return this.formatResponse(updated);
  }

  private formatResponse(resume: any) {
    return {
      id: resume.id,
      originalName: resume.originalName,
      fileSize: resume.fileSize,
      skills: resume.skills as string[],
      experience: resume.experience as any[],
      education: resume.education as any[],
      projects: resume.projects as any[],
      aiSummary: resume.aiSummary,
      matchScore: resume.matchScore,
      uploadedAt: resume.uploadedAt,
      updatedAt: resume.updatedAt,
    };
  }
}

export const resumeService = new ResumeService();
