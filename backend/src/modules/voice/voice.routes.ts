import { Router } from "express";
import multer from "multer";
import { voiceController } from "./voice.controller";
import { startSessionSchema, respondSchema, endSessionSchema } from "./voice.validation";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";

const voiceRouter = Router();

// In-memory multer for audio upload (max 10MB)
const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["audio/webm", "audio/ogg", "audio/mpeg", "audio/wav", "audio/mp4"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported audio format: ${file.mimetype}`));
    }
  },
});

/**
 * @swagger
 * tags:
 *   name: Voice Interview
 *   description: Real-time voice interview with AI personas
 */

/**
 * @swagger
 * /voice/start-session:
 *   post:
 *     summary: Start a new voice interview session
 *     tags: [Voice Interview]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [persona]
 *             properties:
 *               persona:
 *                 type: string
 *                 enum: [Friendly Recruiter, Senior Engineer, Staff Engineer, System Design Interviewer, Behavioral Interviewer]
 *               interviewSessionId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Session created — returns sessionId for subsequent calls
 */
voiceRouter.post(
  "/start-session",
  authenticate,
  validate(startSessionSchema),
  asyncHandler(voiceController.startSession)
);

/**
 * @swagger
 * /voice/transcribe:
 *   post:
 *     summary: Transcribe audio using Deepgram
 *     description: Send audio file as multipart/form-data. Returns transcript text.
 *     tags: [Voice Interview]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [audio]
 *             properties:
 *               audio:
 *                 type: string
 *                 format: binary
 *                 description: Audio file (webm, ogg, wav, mp3)
 *     responses:
 *       200:
 *         description: Transcript returned
 */
voiceRouter.post(
  "/transcribe",
  authenticate,
  audioUpload.single("audio"),
  asyncHandler(voiceController.transcribe)
);

/**
 * @swagger
 * /voice/respond:
 *   post:
 *     summary: Get AI interviewer response + TTS audio
 *     description: Sends candidate transcript, returns AI text response and base64 ElevenLabs audio.
 *     tags: [Voice Interview]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sessionId, transcript]
 *             properties:
 *               sessionId:
 *                 type: string
 *               transcript:
 *                 type: string
 *                 description: The candidate's speech transcript from /voice/transcribe
 *     responses:
 *       200:
 *         description: AI response text + audio (base64 mp3)
 */
voiceRouter.post(
  "/respond",
  authenticate,
  validate(respondSchema),
  asyncHandler(voiceController.respond)
);

/**
 * @swagger
 * /voice/end-session:
 *   post:
 *     summary: End voice interview session and save transcript
 *     tags: [Voice Interview]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sessionId]
 *             properties:
 *               sessionId:
 *                 type: string
 *               interviewSessionId:
 *                 type: string
 *                 nullable: true
 *                 description: If provided, saves transcript to this interview session
 *     responses:
 *       200:
 *         description: Session ended and transcript saved
 */
voiceRouter.post(
  "/end-session",
  authenticate,
  validate(endSessionSchema),
  asyncHandler(voiceController.endSession)
);

/**
 * @swagger
 * /voice/transcript/{sessionId}:
 *   get:
 *     summary: Get current transcript for a voice session
 *     tags: [Voice Interview]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of transcript turns
 */
voiceRouter.get(
  "/transcript/:sessionId",
  authenticate,
  asyncHandler(voiceController.getTranscript)
);

export { voiceRouter };
