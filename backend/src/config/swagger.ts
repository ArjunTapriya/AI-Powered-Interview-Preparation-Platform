import swaggerJsdoc from "swagger-jsdoc";
import path from "path";
import { env } from "./env";

const swaggerDefinition = {
  openapi: "3.0.3",
  info: {
    title: "Interview Preparation Platform API",
    version: "1.0.0",
    description:
      "Production REST API for the AI-Powered Interview Preparation Platform. All responses follow the standard envelope: `{ success, message, data }`.",
    contact: {
      name: "API Support",
    },
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}${env.API_PREFIX}`,
      description: "Development server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ApiResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          message: { type: "string" },
          data: { type: "object", nullable: true },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string" },
          data: { type: "object", nullable: true },
        },
      },
      RadarScores: {
        type: "object",
        properties: {
          correctness: { type: "number", example: 0 },
          speed: { type: "number", example: 0 },
          architecture: { type: "number", example: 0 },
          communication: { type: "number", example: 0 },
        },
      },
      AuthUser: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Arjun Tapriya" },
          email: { type: "string", format: "email", example: "arjun@example.com" },
          isLoggedIn: { type: "boolean", example: true },
          targetCompany: { type: "string", example: "" },
          roleDepth: {
            type: "string",
            nullable: true,
            enum: ["Junior", "Mid-level", "Senior", "Staff/Principal"],
          },
          prepWeeks: { type: "integer", nullable: true, example: null },
          diagnosticCompleted: { type: "boolean", example: false },
          radarScores: { $ref: "#/components/schemas/RadarScores" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      AuthToken: {
        type: "object",
        properties: {
          accessToken: { type: "string" },
          tokenType: { type: "string", example: "Bearer" },
          expiresIn: { type: "string", example: "7d" },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/AuthUser" },
          token: { $ref: "#/components/schemas/AuthToken" },
        },
      },
    },
  },
};

const apiGlob =
  env.NODE_ENV === "production"
    ? [
        path.join(process.cwd(), "dist/modules/**/*.routes.js"),
        path.join(process.cwd(), "dist/routes/**/*.js"),
      ]
    : [
        path.join(process.cwd(), "src/modules/**/*.routes.ts"),
        path.join(process.cwd(), "src/routes/**/*.ts"),
      ];

export const swaggerSpec = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: apiGlob,
});
