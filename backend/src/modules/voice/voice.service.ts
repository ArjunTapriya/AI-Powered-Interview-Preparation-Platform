import { randomUUID } from "crypto";
import { prisma } from "../../config/database";
import { env } from "../../config/env";
import { logger } from "../../utils/logger";
import {
  VoicePersona,
  VoiceSessionDto,
  TranscriptTurnDto,
  TranscribeResponseDto,
  VoiceRespondResponseDto,
  PERSONA_VOICE_MAP,
  PERSONA_ROLE_MAP,
} from "./voice.dto";
import { GeminiProvider } from "../ai/ai.providers/gemini.provider";
import { AppError } from "../../utils/AppError";

// In-memory session store (replace with Redis in production for multi-instance)
const activeSessions = new Map<
  string,
  {
    userId: string;
    persona: VoicePersona;
    interviewSessionId: string | null;
    startedAt: Date;
    transcript: TranscriptTurnDto[];
  }
>();

function getAIProvider() {
  return new GeminiProvider();
}

export class VoiceService {
  /**
   * Start a new voice interview session.
   */
  startSession(
    userId: string,
    persona: VoicePersona,
    interviewSessionId?: string | null
  ): VoiceSessionDto {
    const sessionId = randomUUID();
    activeSessions.set(sessionId, {
      userId,
      persona,
      interviewSessionId: interviewSessionId || null,
      startedAt: new Date(),
      transcript: [],
    });

    logger.info(`Voice session started: ${sessionId} | persona: ${persona} | user: ${userId}`);

    return {
      sessionId,
      persona,
      interviewSessionId: interviewSessionId || null,
      startedAt: new Date().toISOString(),
      transcript: [],
    };
  }

  /**
   * Transcribe audio using Deepgram REST API.
   * Accepts raw audio buffer (Buffer) and returns the transcript.
   */
  async transcribeAudio(
    audioBuffer: Buffer,
    mimeType: string
  ): Promise<TranscribeResponseDto> {
    const apiKey = env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      throw new AppError("DEEPGRAM_API_KEY is not configured", 503);
    }

    const response = await fetch("https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true", {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": mimeType || "audio/webm",
      },
      body: audioBuffer,
    });

    if (!response.ok) {
      const errText = await response.text();
      logger.error("Deepgram API error", { status: response.status, error: errText });
      throw new AppError(`Deepgram transcription failed: ${response.statusText}`, 502);
    }

    const data = (await response.json()) as any;
    const channel = data.results?.channels?.[0]?.alternatives?.[0];
    const transcript = channel?.transcript || "";
    const confidence = channel?.confidence || 0;

    return {
      transcript,
      isFinal: true,
      confidence,
    };
  }

  /**
   * Generate AI interviewer response + synthesize speech via ElevenLabs.
   */
  async generateResponse(
    sessionId: string,
    userTranscript: string
  ): Promise<VoiceRespondResponseDto> {
    const session = activeSessions.get(sessionId);
    if (!session) {
      throw new AppError("Voice session not found or expired", 404);
    }

    // Build conversation history for context
    const history = session.transcript
      .slice(-6) // last 3 turns
      .map((t) => `${t.role === "user" ? "Candidate" : "Interviewer"}: ${t.text}`)
      .join("\n");

    const systemPrompt = `${PERSONA_ROLE_MAP[session.persona]}

Current conversation history:
${history || "(Start of interview)"}

Rules:
- Keep responses concise (2-4 sentences max for voice).
- Ask one focused follow-up question at a time.
- Do NOT reveal evaluation scores during the interview.
- Sound natural and conversational.
- CRITICAL: Read the original question exactly once. Do NOT repeat the question or use repetitive conversational fillers. Once you ask a question, wait for the candidate to answer.
- CRITICAL: When the candidate answers, analyze their answer and provide constructive suggestions based strictly on their answer. Do not be repetitive.`;

    const provider = getAIProvider();
    const aiText = await provider.chat(systemPrompt, `Candidate: ${userTranscript}`);

    // Add turns to session transcript
    session.transcript.push({
      role: "user",
      text: userTranscript,
      timestamp: new Date().toISOString(),
    });
    session.transcript.push({
      role: "interviewer",
      text: aiText,
      timestamp: new Date().toISOString(),
    });

    // Synthesize speech via ElevenLabs
    const audioBase64 = await this.synthesizeSpeech(aiText, session.persona);

    return {
      text: aiText,
      audioBase64,
      mimeType: "audio/mpeg",
    };
  }

  /**
   * Synthesize text to speech using ElevenLabs API.
   */
  private async synthesizeSpeech(text: string, persona: VoicePersona): Promise<string> {
    const apiKey = env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      logger.warn("ELEVENLABS_API_KEY not configured — returning empty audio");
      return "";
    }

    const voiceId = PERSONA_VOICE_MAP[persona];
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      logger.error("ElevenLabs TTS error", { status: response.status, error: errText });
      throw new AppError(`Text-to-speech synthesis failed: ${response.statusText}`, 502);
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    return audioBuffer.toString("base64");
  }

  /**
   * End session: save full transcript to InterviewSession if provided.
   */
  async endSession(
    sessionId: string,
    userId: string,
    interviewSessionId?: string | null
  ): Promise<{ transcriptTurns: number; saved: boolean }> {
    const session = activeSessions.get(sessionId);
    if (!session || session.userId !== userId) {
      throw new AppError("Voice session not found or unauthorized", 404);
    }

    const targetSessionId = interviewSessionId || session.interviewSessionId;
    let saved = false;

    if (targetSessionId && session.transcript.length > 0) {
      try {
        await prisma.interviewSession.updateMany({
          where: { id: targetSessionId, userId },
          data: {
            transcript: session.transcript as any,
          },
        });
        saved = true;
      } catch (err: any) {
        logger.warn(`Could not save voice transcript to session ${targetSessionId}`, { error: err.message });
      }
    }

    const count = session.transcript.length;
    activeSessions.delete(sessionId);
    logger.info(`Voice session ended: ${sessionId} | turns: ${count} | saved: ${saved}`);

    return { transcriptTurns: count, saved };
  }

  /**
   * Get current session transcript (for polling).
   */
  getSessionTranscript(sessionId: string, userId: string): TranscriptTurnDto[] {
    const session = activeSessions.get(sessionId);
    if (!session || session.userId !== userId) return [];
    return session.transcript;
  }
}

export const voiceService = new VoiceService();
