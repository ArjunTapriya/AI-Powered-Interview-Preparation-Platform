import { Conversation, Message } from "@prisma/client";
import { prisma } from "../../config/database";

export class ConversationRepository {
  /**
   * Get or create a conversation for an interview session
   */
  async getOrCreateSessionConversation(userId: string, interviewSessionId: string): Promise<Conversation> {
    let conversation = await prisma.conversation.findUnique({
      where: { interviewSessionId },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          userId,
          interviewSessionId,
        },
      });
    }

    return conversation;
  }

  /**
   * Get recent messages for context
   */
  async getRecentMessages(conversationId: string, limit: number = 20): Promise<Message[]> {
    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      take: limit,
    }).then(msgs => msgs.reverse()); // Return in chronological order
  }

  /**
   * Add a message to a conversation
   */
  async addMessage(data: { conversationId: string; role: string; content: string; messageType?: string }): Promise<Message> {
    return prisma.message.create({
      data: {
        conversationId: data.conversationId,
        role: data.role,
        content: data.content,
        messageType: data.messageType,
      },
    });
  }
}

export const conversationRepository = new ConversationRepository();
