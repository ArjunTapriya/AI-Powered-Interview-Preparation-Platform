import { z } from "zod";

/**
 * Validation schema for PUT /api/users/me.
 *
 * All fields are optional so the client can send partial updates.
 * Security: email, password, subscription, and audit timestamps are
 * not accepted here — they are stripped at the repository layer.
 */
export const updateUserSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be at most 100 characters")
      .optional(),

    targetCompany: z
      .string()
      .trim()
      .max(100, "Target company must be at most 100 characters")
      .optional(),

    roleDepth: z
      .enum(["Junior", "Mid-level", "Senior", "Staff/Principal"], {
        errorMap: () => ({
          message: "roleDepth must be Junior, Mid-level, Senior, or Staff/Principal",
        }),
      })
      .optional(),

    prepWeeks: z
      .number({
        invalid_type_error: "prepWeeks must be a number",
      })
      .int("prepWeeks must be an integer")
      .min(2, "prepWeeks must be at least 2")
      .max(24, "prepWeeks must be at most 24")
      .optional(),

    diagnosticCompleted: z.boolean().optional(),
  })
  .strict();

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
