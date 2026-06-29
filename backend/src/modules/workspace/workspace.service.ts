import { workspaceRepository } from "./workspace.repository";
import { UpsertWorkspaceInput } from "./workspace.validation";
import { WorkspaceStateDto } from "./workspace.dto";

export class WorkspaceService {
  async getState(userId: string): Promise<WorkspaceStateDto | null> {
    return workspaceRepository.findByUserId(userId);
  }

  async saveState(userId: string, input: UpsertWorkspaceInput): Promise<WorkspaceStateDto> {
    return workspaceRepository.upsert(userId, {
      questionId: input.questionId,
      draftCode: input.draftCode,
      language: input.language,
      editorSettings: input.editorSettings ?? undefined,
    });
  }

  async clearState(userId: string): Promise<void> {
    await workspaceRepository.deleteByUserId(userId);
  }
}

export const workspaceService = new WorkspaceService();
