import { prisma } from "../../config/database";
import { WorkspaceStateDto } from "./workspace.dto";

function format(ws: any): WorkspaceStateDto {
  return {
    id: ws.id,
    userId: ws.userId,
    questionId: ws.questionId ?? null,
    draftCode: ws.draftCode ?? null,
    language: ws.language,
    editorSettings: ws.editorSettings ?? null,
    lastSavedAt: ws.lastSavedAt.toISOString(),
    updatedAt: ws.updatedAt.toISOString(),
  };
}

export const workspaceRepository = {
  async findByUserId(userId: string): Promise<WorkspaceStateDto | null> {
    const ws = await prisma.workspaceState.findUnique({ where: { userId } });
    return ws ? format(ws) : null;
  },

  async upsert(
    userId: string,
    data: {
      questionId?: string | null;
      draftCode?: string | null;
      language?: string;
      editorSettings?: object | null;
    }
  ): Promise<WorkspaceStateDto> {
    const ws = await prisma.workspaceState.upsert({
      where: { userId },
      create: {
        userId,
        questionId: data.questionId ?? null,
        draftCode: data.draftCode ?? null,
        language: data.language ?? "javascript",
        editorSettings: data.editorSettings ? (data.editorSettings as any) : undefined,
        lastSavedAt: new Date(),
      },
      update: {
        ...(data.questionId !== undefined && { questionId: data.questionId }),
        ...(data.draftCode !== undefined && { draftCode: data.draftCode }),
        ...(data.language !== undefined && { language: data.language }),
        ...(data.editorSettings !== undefined && { editorSettings: data.editorSettings as any }),
        lastSavedAt: new Date(),
      },
    });
    return format(ws);
  },

  async deleteByUserId(userId: string): Promise<void> {
    await prisma.workspaceState.deleteMany({ where: { userId } });
  },
};
