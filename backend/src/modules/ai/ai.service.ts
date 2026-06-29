import { prisma } from "../../config/database";
import { questionsRepository } from "../questions/questions.repository";
import { interviewsRepository } from "../interviews/interviews.repository";
import { NotFoundError, ForbiddenError } from "../../utils/AppError";
import { logger } from "../../utils/logger";
import { AIProvider } from "./ai.providers/provider.interface";
import { GeminiProvider } from "./ai.providers/gemini.provider";
import {
  buildDsaPrompt,
  buildSystemDesignPrompt,
  buildBehavioralPrompt,
  buildResumeIntelligencePrompt,
  PromptPayload,
} from "./ai.prompts";

export interface EvaluateSessionInput {
  sessionId: string;
  questionId: string;
  answer?: string;
  code?: string;
  executionResults?: any;
}

export class AIService {
  /**
   * Returns the primary AI provider (Gemini).
   */
  private getProvider(): AIProvider {
    return new GeminiProvider();
  }

  /**
  /**
   * Retry with exponential backoff.
   */
  private async retryEvaluate(
    provider: AIProvider,
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
      logger.warn(`AI Provider ${provider.name} failed. Retrying in ${delay}ms...`, { error: err.message });
      await new Promise((resolve) => setTimeout(resolve, delay));
      return this.retryEvaluate(provider, systemPrompt, userPrompt, retries - 1, delay * 2);
    }
  }

  /** Shared retry wrapper used by non-evaluate methods */
  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    retries = 3,
    delay = 1000
  ): Promise<T> {
    try {
      return await fn();
    } catch (err: any) {
      if (retries <= 1) throw err;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return this.executeWithRetry(fn, retries - 1, delay * 2);
    }
  }

  /**
   * Evaluates candidate session submission and writes report findings to PostgreSQL.
   */
  async evaluateSession(userId: string, input: EvaluateSessionInput) {
    const session = await interviewsRepository.getSessionById(input.sessionId);
    if (!session) {
      throw new NotFoundError("Interview session not found");
    }

    if (session.userId !== userId) {
      throw new ForbiddenError("You do not have permission to evaluate this session");
    }

    const question = await questionsRepository.findById(input.questionId);
    if (!question) {
      throw new NotFoundError("Challenge question not found in Bank");
    }

    // 1. Build prompt payloads depending on type
    let promptPayload: PromptPayload;

    if (session.interviewType === "DSA") {
      promptPayload = buildDsaPrompt(
        question.title,
        question.problemStatement,
        "Optimal complexity limits",
        input.code || session.codeSnippet || "",
        input.executionResults || {},
        input.answer || session.transcript || []
      );
    } else if (session.interviewType === "System_Design") {
      promptPayload = buildSystemDesignPrompt(
        question.title,
        question.problemStatement,
        "Scalable architecture layout specifications",
        input.code || session.codeSnippet || "",
        input.answer || session.transcript || []
      );
    } else {
      promptPayload = buildBehavioralPrompt(
        question.title,
        question.problemStatement,
        "STAR methodology structure requirements",
        input.answer || session.transcript || []
      );
    }

    // 2. Execute call using selected provider inside retry block
    const provider = this.getProvider();
    logger.info(`Evaluating session ${input.sessionId} using provider: ${provider.name}`);

    const rawResponse = await this.retryEvaluate(
      provider,
      promptPayload.systemPrompt,
      promptPayload.userPrompt
    );

    // 3. Parse JSON results and provide fallbacks if parsing fails or fields are missing
    let parsed: any;
    try {
      parsed = JSON.parse(rawResponse.trim());
    } catch (err: any) {
      logger.error("Failed to parse AI evaluation response JSON", { raw: rawResponse });
      throw new Error(`AI generated invalid evaluation formatting: ${err.message}`);
    }

    const correctness = Math.max(0, Math.min(100, Number(parsed.correctness) || 70));
    const speed = Math.max(0, Math.min(100, Number(parsed.speed) || 70));
    const architecture = Math.max(0, Math.min(100, Number(parsed.architecture) || 70));
    const communication = Math.max(0, Math.min(100, Number(parsed.communication) || 70));
    const grammar = Math.max(0, Math.min(100, Number(parsed.grammar) || 70));
    const relevance = Math.max(0, Math.min(100, Number(parsed.relevance) || 70));

    const strengths = Array.isArray(parsed.strengths) ? parsed.strengths : ["Story structures completed."];
    const weaknesses = Array.isArray(parsed.weaknesses) ? parsed.weaknesses : ["Could optimize space boundaries."];
    const recommendations = Array.isArray(parsed.recommendations) ? parsed.recommendations : ["Review cache patterns."];
    const feedback = typeof parsed.overallFeedback === "string" ? parsed.overallFeedback : "Performance evaluated successfully.";

    const averageScore = Math.round((correctness + speed + architecture + communication + grammar + relevance) / 6);

    // 4. Save/Upsert results in the database
    const report = await prisma.evaluationReport.upsert({
      where: { interviewSessionId: session.id },
      update: {
        correctness,
        speed,
        architecture,
        communication,
        grammar,
        relevance,
        feedback,
        strengths,
        weaknesses,
        recommendations,
        score: averageScore,
      },
      create: {
        interviewSessionId: session.id,
        correctness,
        speed,
        architecture,
        communication,
        grammar,
        relevance,
        feedback,
        strengths,
        weaknesses,
        recommendations,
        score: averageScore,
      },
    });

    // 5. Sync session overall score in DB
    await prisma.interviewSession.update({
      where: { id: session.id },
      data: {
        overallScore: averageScore,
        // Sync code if provided
        codeSnippet: input.code || undefined,
      },
    });

    // 6. Automatically unlock and complete roadmap node progress on success (score >= 60)
    const challengeToNodeMap: Record<string, string> = {
      "dsa-recurse": "dsa-basics",
      "sys-net": "sys-design-basics",
      "dsa-sliding": "dsa-intermediate",
      "sys-cache": "sys-design-intermediate",
      "dsa-merge-k": "dsa-advanced",
      "sys-rate-limiter": "sys-design-advanced",
      "star-conflict": "star-behavioral",
    };

    const nodeId = challengeToNodeMap[question.id];
    if (nodeId && averageScore >= 60) {
      logger.info(`Automated Roadmap update: Node ${nodeId} completed for user ${userId}`);
      await prisma.roadmapProgress.upsert({
        where: {
          userId_nodeId: { userId, nodeId },
        },
        update: {
          completed: true,
          completedAt: new Date(),
        },
        create: {
          userId,
          nodeId,
          completed: true,
          completedAt: new Date(),
        },
      });
    }

    return {
      reportId: report.id,
      evaluation: {
        correctness,
        speed,
        architecture,
        communication,
        strengths,
        weaknesses,
        recommendations,
        overallFeedback: feedback,
      },
    };
  }

  /**
   * Generate N dynamic technical questions directly from Gemini API tailored to the user's resume.
   */
  async generateDynamicQuestions(resumeText: string, roleLevel: string, count: number, category: string = "Technical", difficulty: string = "Medium"): Promise<any[]> {
    const provider = this.getProvider();
    const systemPrompt = `You are an elite Interviewer. You must generate exactly ${count} highly specific ${category.toLowerCase()} interview questions for a ${roleLevel} candidate based strictly on the technologies, experience, and context mentioned in their resume.
The difficulty of these questions must be strictly: ${difficulty.toUpperCase()}.
${category === "Behavioral" ? "Since this is an HR/Behavioral round, focus on leadership, conflict resolution, project management, and cultural fit." : "Since this is a Technical round, focus on architecture, coding, algorithms, and deep technical concepts."}
Do not output conversational text. Output ONLY a valid JSON array of objects.
Example format:
[
  { "title": "${category === "Behavioral" ? "Resolving Conflicts" : "React State Optimization"}", "description": "Based on your resume experience${category === "Behavioral" ? " leading teams, how do you handle disagreements?" : " with React, how would you optimize frequent re-renders in a deeply nested component tree?"}", "difficulty": "${difficulty}" }
]
The length of the array must be exactly ${count}.`;

    const userPrompt = `Resume details: ${resumeText}`;

    try {
      const response = await this.executeWithRetry(() => provider.evaluate(systemPrompt, userPrompt));
      const cleanJson = response.replace(/```json/g, "").replace(/```/g, "").trim();
      const questions = JSON.parse(cleanJson);
      if (Array.isArray(questions)) {
        return questions;
      }
      return [];
    } catch (err) {
      logger.error("Failed to generate dynamic questions via Gemini", err);
      // Fallback: Generate generic generic questions to fulfill the count
      return Array.from({ length: count }).map((_, i) => ({
        title: `Technical Question ${i + 1}`,
        description: `Describe an advanced technical challenge related to ${roleLevel} engineering and how you approached it.`,
        difficulty: difficulty
      }));
    }
  }

  /**
   * Generate N dynamic Multiple Choice Questions (MCQ) directly from Gemini API tailored to the user's resume.
   */
  async generateDynamicMCQQuestions(resumeText: string, roleLevel: string, count: number, category: string = "Technical", difficulty: string = "Medium"): Promise<any[]> {
    const provider = this.getProvider();
    const systemPrompt = `You are an elite Interviewer. You must generate exactly ${count} highly specific 
multiple choice ${category.toLowerCase()} interview questions for a ${roleLevel} candidate based strictly on the technologies, experience, and context mentioned 
in their resume.
The difficulty of these questions must be strictly: ${difficulty.toUpperCase()}.
${category === "Behavioral" ? "Since this is an HR/Behavioral round, focus on workplace scenarios, leadership, conflict resolution, project management, and cultural fit." : "Since this is a Technical round, focus on architecture, coding, algorithms, and deep technical concepts."}
  Do not output conversational text. Output ONLY a valid JSON array of objects.
  Example format:
  [
    {
      "question": "${category === "Behavioral" ? "Based on your resume experience leading teams, what is the best way to handle a severe disagreement between two senior engineers?" : "Based on your resume experience with React, how would you optimize frequent re-renders in a deeply nested component tree?"}",
      "options": [
        "${category === "Behavioral" ? "Organize a mediated 1-on-1 meeting to find a compromise" : "Use React.memo and useCallback"}",
        "${category === "Behavioral" ? "Immediately fire the underperforming engineer" : "Move state to Redux"}",
        "${category === "Behavioral" ? "Ignore them until they figure it out" : "Force re-render on window load"}",
        "${category === "Behavioral" ? "Report them to HR without talking to them" : "Use componentWillMount"}"
      ],
      "correctAnswer": "${category === "Behavioral" ? "Organize a mediated 1-on-1 meeting to find a compromise" : "Use React.memo and useCallback"}"
    }
  ]
  The length of the array must be exactly ${count}.`;

    const userPrompt = `Resume details: ${resumeText}`;

    try {
      const response = await this.executeWithRetry(() => provider.evaluate(systemPrompt, userPrompt));
      const cleanJson = response.replace(/```json/g, "").replace(/```/g, "").trim();
      const questions = JSON.parse(cleanJson);
      if (Array.isArray(questions)) {
        return questions;
      }
      return [];
    } catch (err) {
      logger.error("Failed to generate dynamic MCQ questions via Gemini", err);
      // Fallback
      return Array.from({ length: count }).map((_, i) => ({
        question: `Technical Concept Question ${i + 1} for ${roleLevel}`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: "Option A"
      }));
    }
  }

  /**
   * Generates a deeply analyzed JSON report from the Elite Resume Intelligence Engine prompt.
   */
  async generateResumeIntelligenceReport(
    resumeText: string,
    targetRole: string,
    targetCompany: string,
    experienceLevel: string,
    jobDescription: string
  ): Promise<any> {
    const provider = this.getProvider();
    const { systemPrompt, userPrompt } = buildResumeIntelligencePrompt(
      resumeText,
      targetRole,
      targetCompany,
      experienceLevel,
      jobDescription
    );

    try {
      const response = await this.executeWithRetry(() => provider.evaluate(systemPrompt, userPrompt), 3, 2000);
      const cleanJson = response.replace(/```json/g, "").replace(/```/g, "").trim();
      const report = JSON.parse(cleanJson);
      return report;
    } catch (err) {
      logger.error("Failed to generate resume intelligence report", err);
      throw new Error("Resume Analysis Failed. Please ensure the resume is readable and try again.");
    }
  }

  /**
   * Evaluates a single answer provided by the user in real-time during an interview practice session.
   */
  async evaluateSingleAnswer(
    question: string,
    answer: string,
    resumeText: string,
    roleLevel: string,
    _usedVoice: boolean
  ): Promise<any> {
    const provider = this.getProvider();

    const systemPrompt = `You are an elite Tech Interviewer evaluating a candidate's answer to a single question.
    
Candidate's Target Role: ${roleLevel}
Candidate's Resume Context: ${resumeText}

Question Asked: "${question}"
Candidate's Answer: "${answer}"

Your task is to analyze the candidate's answer and return a JSON object with exactly these fields:
{
  "relevanceScore": <number 0-100, based on how well they answered the question and mapped it to their resume context>,
  "grammarScore": <number 0-100, based on syntax, vocabulary clarity, and professional tone>,
  "feedback": "<string, a highly conversational, friendly 1-2 sentence response speaking directly to the candidate as if you are talking to them right now. E.g. 'That was a great answer, I loved how you brought up X!'>",
  "improvement": "<string, a concise 1-2 sentence actionable tip to improve the answer>"
}

Do not output anything other than valid JSON. Do not include markdown formatting like \`\`\`json.`;

    const userPrompt = `Please evaluate my answer.`;

    try {
      const response = await this.executeWithRetry(() => provider.evaluate(systemPrompt, userPrompt), 2, 1000);
      const cleanJson = response.replace(/```json/g, "").replace(/```/g, "").trim();
      const evaluation = JSON.parse(cleanJson);

      // Ensure fields exist
      return {
        relevanceScore: typeof evaluation.relevanceScore === 'number' ? evaluation.relevanceScore : 0,
        grammarScore: typeof evaluation.grammarScore === 'number' ? evaluation.grammarScore : 0,
        feedback: evaluation.feedback || "Answer recorded.",
        improvement: evaluation.improvement || "Keep practicing.",
      };
    } catch (err) {
      logger.error("Failed to evaluate single answer via Gemini", err);
      return {
        relevanceScore: 0,
        grammarScore: 0,
        feedback: "Could not evaluate answer dynamically. Network issue occurred.",
        improvement: "Ensure stable connection and try again."
      };
    }
  }

  /**
   * Generates a comprehensive final PDF report summary text based on the entire session logs.
   */
  async generateFinalAnalysisReport(sessionLogs: any[], roleLevel: string): Promise<string> {
    const provider = this.getProvider();

    const logsString = sessionLogs.map((log, i) => `
Q${i + 1}: ${log.question}
Answer: ${log.answerText}
Relevance: ${log.relevanceScore}% | Grammar: ${log.grammarScore}% | Confidence: ${log.confidenceScore || 'N/A'}%
Feedback: ${log.feedback}
`).join('\n');

    const systemPrompt = `You are an elite Tech Interview Evaluator generating a final executive summary report for a ${roleLevel} candidate.
Below is the transcript of their interview session along with their scores for each question.

Session Logs:
${logsString}

Write a comprehensive, professional, and highly detailed markdown report summarizing their overall performance.
Include:
1. An Executive Summary.
2. Key Strengths demonstrated during the interview.
3. Areas for Improvement (Critical analysis of their weak points).
4. Specific Recommendations for their next interview.

Do NOT output conversational text, just the markdown report directly.`;

    try {
      const response = await this.executeWithRetry(() => provider.evaluate(systemPrompt, "Generate the final report."), 2, 2000);
      return response.trim();
    } catch (error) {
      logger.error("Error generating final report from Gemini:", error);
      return "## Report Generation Failed\nWe could not generate the final report due to a network error.";
    }
  }

  /**
   * Generates a 10-step preparation guide based on past interview history, updating existing roadmap if provided.
   */
  async generate10StepPrepGuide(history: any[], category: string, existingSteps?: string[], existingCompleted?: number[]): Promise<string[]> {
    const provider = this.getProvider();

    // Filter history by category
    const relevantHistory = history.filter(h =>
      category === "Technical" ? (h.type === "Technical" || h.type === "DSA" || h.type === "System Design") : h.type === category
    );

    if (relevantHistory.length === 0) {
      return [];
    }

    // Extract weak points and mistakes from history
    const historySummary = relevantHistory.map(h => {
      const feedback = h.feedbackNotes ? h.feedbackNotes.join(" ") : "";
      return `Score: ${h.overallScore}%. Feedback: ${feedback}`;
    }).join("\n");

    let existingRoadmapContext = "";
    if (existingSteps && existingSteps.length > 0) {
      existingRoadmapContext = `\nPREVIOUS ROADMAP GENERATED:\n${existingSteps.map((s, i) => `[${existingCompleted?.includes(i) ? 'X' : ' '}] Step ${i + 1}: ${s}`).join('\n')}
      
IMPORTANT: You MUST keep the previous roadmap in mind ("now updated roadmap... past wale ko mind me rakhna hai"). 
Maintain the steps that the user has already completed or hasn't started yet if they are still highly relevant. Only update, replace, or refine steps that are newly identified weak areas based on the most recent interview history. Do NOT generate a completely unrelated list from scratch.`;
    }

    const systemPrompt = `You are an elite career coach. Based on the following interview history for a ${category} round, generate a highly actionable 10-step preparation guide to help the candidate improve.
Interview History Summary:
${historySummary}
${existingRoadmapContext}

Your response MUST be exactly 10 bullet points. Each bullet point must be a concise, actionable step (1-2 sentences max).
Do not include any introductory or concluding text. Just the 10 steps.
Format each step as a plain string, NO markdown bullet points or numbers (we will render them in the UI).
Output ONLY a raw JSON array of 10 strings.

Example:
[
  "Review hash map concepts to improve O(1) lookup times.",
  "Practice STAR method focusing on the 'Result' phase."
]
`;

    try {
      const response = await this.executeWithRetry(() => provider.evaluate(systemPrompt, "Generate the 10 steps."), 2, 1000);
      const cleanJson = response.replace(/```json/g, "").replace(/```/g, "").trim();
      const steps = JSON.parse(cleanJson);

      if (Array.isArray(steps) && steps.length > 0) {
        return steps.slice(0, 10);
      }
      throw new Error("Invalid output format");
    } catch (err) {
      logger.error("Failed to generate 10-step prep guide via Gemini", err);
      // Fallbacks
      return [
        `Review fundamental ${category} concepts.`,
        "Analyze mistakes from previous sessions.",
        "Practice time management during answers.",
        "Focus on clarity and conciseness.",
        "Take another mock interview to baseline progress.",
        "Identify recurring weak spots.",
        "Study optimal solutions for missed questions.",
        "Engage in peer-to-peer mock interviews.",
        "Review core foundational materials.",
        "Stay calm and confident."
      ];
    }
  }
}

export const aiService = new AIService();
