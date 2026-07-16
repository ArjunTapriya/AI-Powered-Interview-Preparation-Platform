import { Request, Response } from "express";
import { aiFeedbackService } from "./ai-feedback.service";
import { logger } from "../../utils/logger";

export const aiFeedbackController = {
  getConversations: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }
      const conversations = await aiFeedbackService.getConversations(userId);
      res.json({ success: true, data: conversations });
      return;
    } catch (error: any) {
      logger.error("Error fetching AI feedback conversations", { error: error.message });
      res.status(500).json({ success: false, message: error.message });
      return;
    }
  },

  createConversation: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }
      const newConv = await aiFeedbackService.createConversation(userId);
      res.status(201).json({ success: true, data: newConv });
      return;
    } catch (error: any) {
      logger.error("Error creating AI feedback conversation", { error: error.message });
      res.status(500).json({ success: false, message: error.message });
      return;
    }
  },

  sendMessage: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }
      const conversationId = req.params.conversationId as string;
      const { message } = req.body;

      if (!message) {
        res.status(400).json({ success: false, message: "Message is required" });
        return;
      }

      const response = await aiFeedbackService.sendMessage(userId, conversationId, message);
      res.json({ success: true, data: response });
      return;
    } catch (error: any) {
      logger.error("Error sending message to AI feedback", { error: error.message });
      res.status(500).json({ success: false, message: error.message });
      return;
    }
  },

  renameConversation: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }
      const conversationId = req.params.conversationId as string;
      const { title } = req.body;

      await aiFeedbackService.renameConversation(userId, conversationId, title);
      res.json({ success: true, message: "Conversation renamed successfully" });
      return;
    } catch (error: any) {
      logger.error("Error renaming AI feedback conversation", { error: error.message });
      res.status(500).json({ success: false, message: error.message });
      return;
    }
  },

  deleteConversation: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }
      const conversationId = req.params.conversationId as string;

      await aiFeedbackService.deleteConversation(userId, conversationId);
      res.json({ success: true, message: "Conversation deleted successfully" });
      return;
    } catch (error: any) {
      logger.error("Error deleting AI feedback conversation", { error: error.message });
      res.status(500).json({ success: false, message: error.message });
      return;
    }
  },
};
