import { prisma } from "../../config/database";

export interface UpsertResumeData {
  userId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  extractedText: string;
  skills: any;
  experience: any;
  education: any;
  projects: any;
  aiSummary?: string;
  matchScore?: number;
}

export const resumeRepository = {
  async upsert(data: UpsertResumeData) {
    return prisma.resume.upsert({
      where: { userId: data.userId },
      create: {
        userId: data.userId,
        filename: data.filename,
        originalName: data.originalName,
        mimeType: data.mimeType,
        fileSize: data.fileSize,
        extractedText: data.extractedText,
        skills: data.skills,
        experience: data.experience,
        education: data.education,
        projects: data.projects,
        aiSummary: data.aiSummary,
        matchScore: data.matchScore,
      },
      update: {
        filename: data.filename,
        originalName: data.originalName,
        mimeType: data.mimeType,
        fileSize: data.fileSize,
        extractedText: data.extractedText,
        skills: data.skills,
        experience: data.experience,
        education: data.education,
        projects: data.projects,
        aiSummary: data.aiSummary,
        matchScore: data.matchScore,
        updatedAt: new Date(),
      },
    });
  },

  async findByUserId(userId: string) {
    return prisma.resume.findUnique({ where: { userId } });
  },

  async deleteByUserId(userId: string) {
    return prisma.resume.delete({ where: { userId } });
  },
};
