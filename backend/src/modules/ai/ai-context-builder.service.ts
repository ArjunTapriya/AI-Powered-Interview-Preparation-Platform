import { executionRepository } from "../code-execution/execution.repository";
import { conversationRepository } from "../conversations/conversation.repository";

export class AiContextBuilderService {
  /**
   * Build an execution and history context block to prepend to the LLM prompt.
   */
  async buildContext(userId: string, interviewSessionId: string, questionId: string) {
    // 1. Get Conversation History
    const conversation = await conversationRepository.getOrCreateSessionConversation(userId, interviewSessionId);
    const messages = await conversationRepository.getRecentMessages(conversation.id, 10);
    
    // 2. Get Code Submissions (Last 3)
    const { submissions } = await executionRepository.findSubmissions(userId, { questionId, limit: 3 });
    
    // 3. Format Submissions
    let executionHistoryContext = "";
    if (submissions && submissions.length > 0) {
      executionHistoryContext = "\n--- RECENT CODE SUBMISSIONS ---\n";
      submissions.reverse().forEach((sub, index) => {
        executionHistoryContext += `[Attempt ${index + 1}]\n`;
        executionHistoryContext += `Code (${sub.language}):\n${sub.sourceCode}\n`;
        executionHistoryContext += `Status: ${sub.status} | Passed: ${sub.passedTests}/${sub.totalTests}\n`;
        if (sub.stderr) {
          executionHistoryContext += `Error: ${sub.stderr}\n`;
        }
      });
    }

    return {
      conversationId: conversation.id,
      previousMessages: messages.map(m => ({ role: m.role, content: m.content })),
      executionHistoryContext
    };
  }
}

export const aiContextBuilderService = new AiContextBuilderService();
