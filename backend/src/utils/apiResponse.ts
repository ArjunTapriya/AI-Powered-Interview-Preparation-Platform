import { Response } from "express";

export interface ApiResponseBody<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = "Success",
  statusCode = 200
): Response {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  } satisfies ApiResponseBody<T>);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  data: unknown = null
): Response {
  return res.status(statusCode).json({
    success: false,
    message,
    data,
  } satisfies ApiResponseBody);
}

export function omitPassword<T extends { password?: string }>(
  user: T
): Omit<T, "password"> {
  const { password: _, ...rest } = user;
  return rest;
}
