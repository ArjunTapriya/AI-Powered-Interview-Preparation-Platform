import { InterviewSession, EvaluationReport, InterviewType } from "@prisma/client";

// Shape expected by the frontend's DashboardHome.tsx
export interface InterviewSessionDto {
  id: string;
  company: string;
  date: string;
  type: "DSA" | "System Design" | "Behavioral";
  overallScore: number;
  durationMin: number;
  codeSnippet?: string;
  metrics: {
    correctness: number;
    speed: number;
    architecture: number;
    communication: number;
  };
  transcript?: any;
  feedbackNotes?: any;
  optimalCode?: string;
}

type SessionWithReport = InterviewSession & { evaluation?: EvaluationReport | null };

/** Frontend string -> Prisma enum */
const TYPE_TO_PRISMA: Record<string, InterviewType> = {
  DSA: InterviewType.DSA,
  "System Design": InterviewType.System_Design,
  Behavioral: InterviewType.Behavioral,
};

/** Prisma enum -> Frontend string */
const TYPE_TO_API: Record<InterviewType, InterviewSessionDto["type"]> = {
  DSA: "DSA",
  System_Design: "System Design",
  Behavioral: "Behavioral",
};

/**
 * Maps the Prisma row to the exact shape expected by DashboardHome.tsx history[].
 */
export function toSessionDto(session: SessionWithReport): InterviewSessionDto {
  let transcriptObj;
  try {
    transcriptObj = session.transcript ? JSON.parse(session.transcript) : undefined;
  } catch (e) {
    transcriptObj = session.transcript;
  }

  let feedbackNotesObj;
  try {
    feedbackNotesObj = session.feedbackNotes ? JSON.parse(session.feedbackNotes) : undefined;
  } catch (e) {
    feedbackNotesObj = session.feedbackNotes;
  }

  return {
    id: session.id,
    company: session.company || "Unknown",
    date: session.createdAt.toISOString().split("T")[0],
    type: TYPE_TO_API[session.interviewType],
    overallScore: session.overallScore ?? 0,
    durationMin: session.durationMin ?? 0,
    codeSnippet: session.codeSnippet || undefined,
    optimalCode: session.optimalCode || undefined,
    transcript: transcriptObj,
    feedbackNotes: feedbackNotesObj,
    metrics: {
      correctness: session.evaluation?.correctness ?? 0,
      speed: session.evaluation?.speed ?? 0,
      architecture: session.evaluation?.architecture ?? 0,
      communication: session.evaluation?.communication ?? 0,
    },
  };
}

export function parseInterviewType(type: string): InterviewType {
  return TYPE_TO_PRISMA[type] || InterviewType.Behavioral;
}
