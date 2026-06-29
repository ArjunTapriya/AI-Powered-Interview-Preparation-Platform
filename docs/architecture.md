# Interview Prep Architecture

## Layers
1. **Controller Layer:** Express routes & basic validations.
2. **Service Layer:** Business logic (e.g. `auth.service.ts`, `execution.service.ts`, `voice.service.ts`).
3. **Repository Layer:** Database persistence with Prisma.

## Modules
- **Auth**: JWT, Refresh Tokens, bcrypt hashing.
- **AI**: Gemini and OpenAI dual-provider with automatic failover mechanism.
- **Code Execution**: Polyglot template engine (Array, String, Matrix, Tree, Graph, Linked List) driving isolated tests via LeetCode-query API or custom sandboxes.
- **Voice**: In-memory transcription session manager mapped to Deepgram (STT) and ElevenLabs (TTS).
- **Workspace**: Persisted autosave caching frontend code drafts using Prisma upserts.
- **Question Generation**: Bulk AI job queue to generate fresh questions into the database.
