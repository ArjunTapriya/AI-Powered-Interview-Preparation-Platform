import { z } from "zod";

export const startSessionSchema = z.object({
  persona: z.enum([
    "Friendly Recruiter",
    "Senior Engineer",
    "Staff Engineer",
    "System Design Interviewer",
    "Behavioral Interviewer",
  ]),
  interviewSessionId: z.string().uuid().optional().nullable(),
});

export const transcribeSchema = z.object({
  sessionId: z.string().uuid(),
});

export const respondSchema = z.object({
  sessionId: z.string().uuid(),
  transcript: z.string().min(1).max(5000),
});

export const endSessionSchema = z.object({
  sessionId: z.string().uuid(),
  interviewSessionId: z.string().uuid().optional().nullable(),
});

export type StartSessionInput = z.infer<typeof startSessionSchema>;
export type RespondInput = z.infer<typeof respondSchema>;
export type EndSessionInput = z.infer<typeof endSessionSchema>;
