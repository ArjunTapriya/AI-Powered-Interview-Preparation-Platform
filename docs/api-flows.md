# API Flows

## Authentication
1. `POST /auth/signup` -> Creates User -> Returns JWT (15m) + Refresh Token (7d).
2. `POST /auth/login` -> Verifies bcrypt hash -> Returns JWT + Refresh.
3. `POST /auth/refresh` -> Cookie-based rotation. Revokes old token, issues new pair.
4. `POST /auth/logout` -> Revokes active token.

## Code Execution
1. `POST /execution/run`
   - Uses `ExecutionService`
   - Identifies the `executionTemplate` (e.g. `ARRAY_INPUT`, `MATRIX`)
   - Uses `template.engine.ts` to wrap user draft code with execution bindings
   - Submits to internal engine or external API
   - Returns STDOUT/STDERR/Success

## Voice Session
1. `POST /voice/transcribe` -> Sends raw audio buffer to Deepgram STT -> Returns text.
2. `POST /voice/respond` -> Appends text to `InterviewSession` transcript. Prompts AI for response. Passes AI response to ElevenLabs TTS -> Returns base64 audio and metadata.

## Question Generation
1. `POST /question-generation/bulk-generate` -> Admin only. Spawns async interval to poll Gemini/OpenAI. Updates `GenerationJob` model status from `PENDING` -> `DONE` or `FAILED`.
