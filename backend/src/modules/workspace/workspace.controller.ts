import { Request, Response } from "express";
import { workspaceService } from "./workspace.service";
import { sendSuccess } from "../../utils/apiResponse";
import { UpsertWorkspaceInput } from "./workspace.validation";

export class WorkspaceController {
  getState = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const state = await workspaceService.getState(userId);
    sendSuccess(res, { state }, "Workspace state retrieved");
  };

  saveState = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const input = req.body as UpsertWorkspaceInput;
    const state = await workspaceService.saveState(userId, input);
    sendSuccess(res, { state }, "Workspace state saved");
  };

  clearState = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    await workspaceService.clearState(userId);
    sendSuccess(res, null, "Workspace state cleared");
  };
}

export const workspaceController = new WorkspaceController();
