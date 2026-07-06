import { describe, it, expect, vi, beforeEach } from "vitest";
import { workspaceService } from "./workspace.service";
import { workspaceRepository } from "./workspace.repository";

// Mock the repository to prevent database calls during tests
vi.mock("./workspace.repository", () => ({
  workspaceRepository: {
    findByUserId: vi.fn(),
    upsert: vi.fn(),
    deleteByUserId: vi.fn(),
  },
}));

describe("WorkspaceService", () => {
  const userId = "test-user-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getState", () => {
    it("should return workspace state if it exists", async () => {
      const mockState = {
        id: "ws-1",
        userId,
        questionId: "q-1",
        draftCode: "console.log('test');",
        language: "javascript",
        editorSettings: null,
        lastSavedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      vi.mocked(workspaceRepository.findByUserId).mockResolvedValueOnce(mockState);

      const result = await workspaceService.getState(userId);
      expect(workspaceRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockState);
    });

    it("should return null if workspace state does not exist", async () => {
      vi.mocked(workspaceRepository.findByUserId).mockResolvedValueOnce(null);

      const result = await workspaceService.getState(userId);
      expect(workspaceRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toBeNull();
    });
  });

  describe("saveState", () => {
    it("should save and return the workspace state", async () => {
      const input = {
        questionId: "q-2",
        draftCode: "function solve() {}",
        language: "python" as const,
      };

      const mockSavedState = {
        id: "ws-2",
        userId,
        ...input,
        editorSettings: null,
        lastSavedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(workspaceRepository.upsert).mockResolvedValueOnce(mockSavedState);

      const result = await workspaceService.saveState(userId, input);
      
      expect(workspaceRepository.upsert).toHaveBeenCalledWith(userId, {
        questionId: input.questionId,
        draftCode: input.draftCode,
        language: input.language,
        editorSettings: undefined,
      });
      expect(result).toEqual(mockSavedState);
    });
  });

  describe("clearState", () => {
    it("should delete the workspace state", async () => {
      vi.mocked(workspaceRepository.deleteByUserId).mockResolvedValueOnce();

      await workspaceService.clearState(userId);
      expect(workspaceRepository.deleteByUserId).toHaveBeenCalledWith(userId);
    });
  });
});
