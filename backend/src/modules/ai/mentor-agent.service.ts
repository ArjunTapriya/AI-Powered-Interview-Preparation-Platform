import { aiContextBuilderService } from "./ai-context-builder.service";
import { conversationRepository } from "../conversations/conversation.repository";
import { GeminiProvider } from "./ai.providers/gemini.provider";
import { logger } from "../../utils/logger";

export class MentorAgentService {
  private getProvider() {
    return new GeminiProvider();
  }

  /**
   * Generates a pedagogical hint or response based on the user's code and history.
   */
  async getMentorResponse(
    userId: string,
    interviewSessionId: string,
    questionId: string,
    userMessage: string,
    currentCode: string,
    mode: "hint" | "debug" | "test-case" | "complexity" | "general" = "general",
    errorLogs?: string
  ): Promise<{ response: string; conversationId: string }> {
    const context = await aiContextBuilderService.buildContext(userId, interviewSessionId, questionId);
    
    // Save User Message
    await conversationRepository.addMessage({
      conversationId: context.conversationId,
      role: "user",
      content: userMessage,
    });

    let modeSpecificInstructions = "";
    
    switch (mode) {
      case "hint":
        modeSpecificInstructions = "You are in HINT MODE. Provide a small, progressive hint without giving away the exact code. Ask a leading question.";
        break;
      case "debug":
        modeSpecificInstructions = `You are in DEBUG MODE. Analyze the user's code and point out likely runtime or syntax errors. Provide an explanation of why it might fail. \nError Logs provided: ${errorLogs || "None"}`;
        break;
      case "test-case":
        modeSpecificInstructions = `You are in TEST CASE ANALYSIS MODE. Review the execution history and explain why the code fails on specific boundary/edge cases. Guide them toward fixes.`;
        break;
      case "complexity":
        modeSpecificInstructions = `You are in COMPLEXITY ANALYSIS MODE. Analyze the Time Complexity and Space Complexity of the provided code. Suggest optimization strategies.`;
        break;
      default:
        modeSpecificInstructions = "Answer the user's query normally, preferring hints over direct answers.";
    }

    const systemPrompt = `You are an expert AI Coding Mentor named "Antigravity Mentor".
Your goal is to guide the user to the correct solution without giving away the direct answer immediately.
RULES:
1. Encourage independent thinking.
2. Keep your responses concise, encouraging, and highly technical.
3. You are speaking to a software engineering candidate.
4. Use markdown formatting for code snippets.

${modeSpecificInstructions}

${context.executionHistoryContext}

Current Code in Editor:
\`\`\`
${currentCode}
\`\`\`
`;

    // Format previous messages for the provider
    const previousMessages = context.previousMessages.map(m => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content
    }));

    previousMessages.push({ role: "user", content: userMessage });

    const provider = this.getProvider();
    let aiResponse = "";

    try {
      // In a real implementation with streaming, we would return a stream.
      // For now, we wait for the full generation.
      aiResponse = await provider.chat(systemPrompt, userMessage);
    } catch (err: any) {
      logger.error("Mentor agent failed to generate response", { error: err.message });
      throw new Error("AI Mentor is currently unavailable.");
    }

    // Save AI Response
    await conversationRepository.addMessage({
      conversationId: context.conversationId,
      role: "assistant",
      content: aiResponse,
    });

    return {
      response: aiResponse,
      conversationId: context.conversationId,
    };
  }
}

export const mentorAgentService = new MentorAgentService();
