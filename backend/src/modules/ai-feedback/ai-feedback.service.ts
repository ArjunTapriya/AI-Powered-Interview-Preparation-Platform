import { prisma } from "../../config/database";
import { GeminiProvider } from "../ai/ai.providers/gemini.provider";
import { conversationRepository } from "../conversations/conversation.repository";

export class AIFeedbackService {
  private aiProvider: GeminiProvider;

  constructor() {
    this.aiProvider = new GeminiProvider();
  }

  /**
   * Fetch context for the user to inject into AI prompt
   */
  private async getUserContext(userId: string) {
    const [user, resume, roadmapProgress, interviewSessions] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.resume.findUnique({ where: { userId } }),
      prisma.roadmapProgress.findMany({ where: { userId } }),
      prisma.interviewSession.findMany({
        where: { userId, status: "COMPLETED" },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
    ]);

    const completedNodes = roadmapProgress.filter((p) => p.status === "COMPLETED").length;
    const totalNodes = 30; // Approx based on typical roadmap structure
    const roadmapPercent = Math.round((completedNodes / totalNodes) * 100);

    let contextStr = `\n--- USER CONTEXT ---\n`;
    contextStr += `Name: ${user?.name || "Candidate"}\n`;
    contextStr += `Roadmap Progress: ${roadmapPercent}% completed (${completedNodes} nodes).\n`;

    if (resume && resume.skills) {
      try {
        const skillsObj = typeof resume.skills === "string" ? JSON.parse(resume.skills) : resume.skills;
        contextStr += `Skills: ${Array.isArray(skillsObj.current) ? skillsObj.current.join(", ") : "Not specified"}\n`;
        contextStr += `Resume Score: ${resume.matchScore}\n`;
      } catch (e) {}
    }

    if (interviewSessions.length > 0) {
      contextStr += `Recent Interviews:\n`;
      interviewSessions.forEach((session) => {
        contextStr += `- ${session.interviewType}: Score ${session.overallScore || "N/A"}/100\n`;
      });
    }

    contextStr += `--- END CONTEXT ---\n`;
    return contextStr;
  }

  /**
   * Enforce max 5 conversations
   */
  private async enforceConversationLimit(userId: string) {
    const conversations = await prisma.conversation.findMany({
      where: { userId, interviewSessionId: null },
      orderBy: { createdAt: "asc" },
    });

    if (conversations.length > 5) {
      // If exceeding 5, delete the oldest
      const toDeleteCount = conversations.length - 5;
      const idsToDelete = conversations.slice(0, toDeleteCount).map(c => c.id);
      
      await prisma.conversation.deleteMany({
        where: { id: { in: idsToDelete } },
      });
    }
  }

  /**
   * Get all active AI feedback conversations for a user
   */
  async getConversations(userId: string) {
    return prisma.conversation.findMany({
      where: { userId, interviewSessionId: null },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "asc" }
        }
      }
    });
  }

  /**
   * Start a new conversation or get existing, enforcing limits
   */
  async createConversation(userId: string) {
    const newConv = await prisma.conversation.create({
      data: { userId }
    });
    
    await this.enforceConversationLimit(userId);
    return newConv;
  }

  /**
   * Send a message to a conversation and get AI response
   */
  async sendMessage(userId: string, conversationId: string, message: string) {
    // Validate conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation || conversation.userId !== userId) {
      throw new Error("Conversation not found or unauthorized.");
    }

    // Add user message
    await conversationRepository.addMessage({
      conversationId,
      role: "user",
      content: message,
    });

    // Fetch context and history
    const [userContext, history] = await Promise.all([
      this.getUserContext(userId),
      conversationRepository.getRecentMessages(conversationId, 15) // fetch last 15 msgs
    ]);

    const systemPrompt = `You are an expert AI Interview Coach and Mentor. 
Your goal is to guide the user in DSA, System Design, behavioral prep, and general career strategy.
You are extremely knowledgeable, encouraging, but concise. Use markdown formatting to make your responses easy to read (bolding, lists, code blocks, tables).
Do not break character. 

${userContext}

Use this context to personalize your advice when relevant (e.g., if they ask about what to study, refer to their roadmap progress or skills).`;

    // Construct history for Gemini
    const chatHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      content: msg.content
    }));
    
    try {
      // slice(0, -1) because the last message is the current user message, which gemini provider appends manually
      const aiResponse = await this.aiProvider.chatWithHistory(systemPrompt, chatHistory.slice(0, -1), message);

      // Save AI message
      const savedAiMsg = await conversationRepository.addMessage({
        conversationId,
        role: "assistant",
        content: aiResponse,
      });

      // Update conversation timestamp
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() }
      });

      return {
        reply: savedAiMsg,
      };
    } catch (error: any) {
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }

  /**
   * Rename a conversation
   */
  async renameConversation(userId: string, conversationId: string, title: string) {
    return prisma.conversation.updateMany({
      where: { id: conversationId, userId },
      data: { title }
    });
  }

  /**
   * Clear all (or delete specific) conversations
   */
  async deleteConversation(userId: string, conversationId: string) {
    return prisma.conversation.deleteMany({
      where: { id: conversationId, userId }
    });
  }
}

export const aiFeedbackService = new AIFeedbackService();
