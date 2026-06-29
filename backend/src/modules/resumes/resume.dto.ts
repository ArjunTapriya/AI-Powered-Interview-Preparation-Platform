import { z } from 'zod';

export const CreateResumeInput = z.object({
  userId: z.string().uuid(),
  // file will be handled by multer, filename and path stored separately
});

export type CreateResumeInput = z.infer<typeof CreateResumeInput>;

export const ResumeDto = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  filename: z.string(),
  extractedText: z.string(),
  parsedData: z.any().optional(),
  skills: z.array(z.string()).optional(),
  projects: z.array(z.any()).optional(),
  experience: z.array(z.any()).optional(),
  education: z.array(z.any()).optional(),
  uploadedAt: z.string().datetime(),
});

export type ResumeDto = z.infer<typeof ResumeDto>;
