import { z } from "zod";

export const editorSettingsSchema = z
  .object({
    fontSize: z.number().min(10).max(32).optional(),
    theme: z.string().max(50).optional(),
    tabSize: z.number().min(1).max(8).optional(),
    wordWrap: z.boolean().optional(),
  })
  .optional()
  .nullable();

export const upsertWorkspaceSchema = z
  .object({
    questionId: z.string().uuid().optional().nullable(),
    draftCode: z.string().max(500_000).optional().nullable(),
    language: z
      .enum(["javascript", "python", "cpp", "java", "typescript"])
      .optional(),
    editorSettings: editorSettingsSchema,
  })
  .strict();

export type UpsertWorkspaceInput = z.infer<typeof upsertWorkspaceSchema>;
