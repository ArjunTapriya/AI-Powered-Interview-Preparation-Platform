# Interview Prep Platform

Interview Prep is a production-grade SaaS platform designed to help software engineers prepare for technical interviews using AI-driven simulated interviews, code execution, and system design sandboxes.

## Features

- **Auth System:** JWT-based authentication with secure refresh token rotation.
- **AI Integration:** Dual provider system (Gemini & OpenAI) with automatic failover.
- **Code Execution:** Universal execution framework with polyglot template engine (Array, String, Matrix, Tree, Graph, Linked List).
- **Voice Interviews:** Real-time AI interview simulations via Deepgram (STT) and ElevenLabs (TTS).
- **Persistent Workspace:** Autosave-enabled integrated development environment.
- **Admin Dashboard:** Monitor platform stats and launch bulk AI question generation jobs.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, TailwindCSS
- **Backend:** Node.js, Express, Prisma, PostgreSQL
- **AI Providers:** Google Gemini, OpenAI
- **Voice & Speech:** Deepgram, ElevenLabs
- **Testing:** Vitest, React Testing Library

## Getting Started

### Prerequisites
- Node.js (v20+)
- PostgreSQL Database

### Installation

1. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env` in the backend folder and fill in your API keys and database credentials.

4. Run Database Migrations:
   ```bash
   cd backend
   npx prisma migrate dev
   ```

### Running Locally

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend server:
   ```bash
   npm run dev
   ```

## Documentation
- [Architecture Overview](./docs/architecture.md)
- [API Flows](./docs/api-flows.md)
