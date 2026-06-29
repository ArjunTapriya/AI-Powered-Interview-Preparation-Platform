export type VoicePersona =
  | "Friendly Recruiter"
  | "Senior Engineer"
  | "Staff Engineer"
  | "System Design Interviewer"
  | "Behavioral Interviewer";

export interface VoiceSessionDto {
  sessionId: string;
  persona: VoicePersona;
  interviewSessionId?: string | null;
  startedAt: string;
  transcript: TranscriptTurnDto[];
}

export interface TranscriptTurnDto {
  role: "user" | "interviewer";
  text: string;
  timestamp: string;
}

export interface TranscribeResponseDto {
  transcript: string;
  isFinal: boolean;
  confidence: number;
}

export interface VoiceRespondResponseDto {
  text: string;
  audioBase64: string;
  mimeType: "audio/mpeg";
}

/** Maps persona → ElevenLabs voice ID */
export const PERSONA_VOICE_MAP: Record<VoicePersona, string> = {
  "Friendly Recruiter": "21m00Tcm4TlvDq8ikWAM",    // Rachel
  "Senior Engineer": "ErXwobaYiN019PkySvjV",         // Antoni
  "Staff Engineer": "VR6AewLTigWG4xSOukaG",          // Arnold
  "System Design Interviewer": "TxGEqnHWrfWFTfGW9XjX", // Josh
  "Behavioral Interviewer": "MF3mGyEYCl7XYWbV9V6O",  // Elli
};

/** Maps persona → interviewer role description for AI prompt */
export const PERSONA_ROLE_MAP: Record<VoicePersona, string> = {
  "Friendly Recruiter":
    "You are a warm, encouraging recruiter at a top tech company conducting a 30-minute phone screen. Be conversational and supportive.",
  "Senior Engineer":
    "You are a Senior Software Engineer conducting a technical DSA interview. Ask precise, focused questions. Challenge the candidate appropriately.",
  "Staff Engineer":
    "You are a Staff Engineer. Ask deep technical questions about system design, architecture tradeoffs, and coding best practices.",
  "System Design Interviewer":
    "You are a Principal Infrastructure Architect. Focus exclusively on system design: scalability, availability, consistency, database choices, and distributed systems.",
  "Behavioral Interviewer":
    "You are a Senior Engineering Manager. Use the STAR framework. Ask about leadership, conflict resolution, ownership, and impact.",
};
