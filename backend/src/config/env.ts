export const env = {
  // Existing env variables
  DATABASE_URL: process.env.DATABASE_URL || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  // Voice service keys
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY || '',
  DEEPGRAM_API_KEY: process.env.DEEPGRAM_API_KEY || '',
  // JWT secrets and config
  JWT_SECRET: process.env.JWT_SECRET || 'supersecret',
  JWT_ALGORITHM: process.env.JWT_ALGORITHM || 'HS256',
  ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'supersecretadmin',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  // Refresh token config (TODO 8)
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  // Server configuration
  PORT: Number(process.env.PORT) || 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_PREFIX: process.env.API_PREFIX || '/api',
  // Swagger toggle
  swaggerEnabled: process.env.SWAGGER_ENABLED === 'true',
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX) || 100,
  // CORS
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['*'],
  // Judge0 execution service (code execution)
  JUDGE0_API_URL: process.env.JUDGE0_API_URL || 'https://judge0.p.rapidapi.com',
  JUDGE0_API_KEY: process.env.JUDGE0_API_KEY || '',
  // AI provider selection: 'gemini' | 'openai' (TODO 6)
  AI_PROVIDER: process.env.AI_PROVIDER || 'gemini',
  AI_FAILOVER_ENABLED: process.env.AI_FAILOVER_ENABLED !== 'false', // default true
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o',
  // Razorpay payment gateway
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
  // Server shutdown timeout
  SHUTDOWN_TIMEOUT_MS: Number(process.env.SHUTDOWN_TIMEOUT_MS) || 5000,
};
