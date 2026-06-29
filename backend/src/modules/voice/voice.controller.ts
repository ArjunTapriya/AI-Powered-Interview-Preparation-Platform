import { Request, Response } from "express";
import { voiceService } from "./voice.service";
import { sendSuccess } from "../../utils/apiResponse";
import { AppError } from "../../utils/AppError";
import { StartSessionInput, RespondInput, EndSessionInput } from "./voice.validation";
import { VoicePersona } from "./voice.dto";

export class VoiceController {
  startSession = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const body = req.body as StartSessionInput;
    const session = voiceService.startSession(userId, body.persona as VoicePersona, body.interviewSessionId);
    sendSuccess(res, session, "Voice session started", 201);
  };

  transcribe = async (req: Request, res: Response): Promise<void> => {
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) {
      throw new AppError("Audio file is required (multipart/form-data field: audio)", 400);
    }

    const result = await voiceService.transcribeAudio(file.buffer, file.mimetype);
    sendSuccess(res, result, "Transcription complete");
  };

  respond = async (req: Request, res: Response): Promise<void> => {
    const body = req.body as RespondInput;
    const result = await voiceService.generateResponse(body.sessionId, body.transcript);
    sendSuccess(res, result, "AI response generated");
  };

  endSession = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const body = req.body as EndSessionInput;
    const result = await voiceService.endSession(body.sessionId, userId, body.interviewSessionId);
    sendSuccess(res, result, "Voice session ended");
  };

  getTranscript = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const sessionId = req.params.sessionId as string;
    const transcript = voiceService.getSessionTranscript(sessionId, userId);
    sendSuccess(res, { transcript }, "Transcript retrieved");
  };
}

export const voiceController = new VoiceController();
