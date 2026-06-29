import { GeminiProvider } from "../ai/ai.providers/gemini.provider";
import { logger } from "../../utils/logger";
import { GeneratedQuestion } from "./question-generation.service";

export interface GeneratedEditorial {
  content: string; // Markdown content with approach explanation
  timeComplexity: string;
  spaceComplexity: string;
}

export class EditorialGenerationService {
  private getProvider() {
    return new GeminiProvider();
  }

  async generateEditorial(question: GeneratedQuestion): Promise<GeneratedEditorial> {
    const provider = this.getProvider();
    
    const systemPrompt = `You are a technical editorial writer.
Given the following Data Structure & Algorithm problem, generate a comprehensive editorial.

Problem: ${question.title}
Topic: ${question.topic}
Difficulty: ${question.difficulty}

Statement:
${question.problemStatement}

REQUIREMENTS:
1. Explain the optimal approach to solve the problem clearly.
2. Provide the Big-O Time and Space complexities.

YOU MUST RETURN A VALID JSON OBJECT WITH THE FOLLOWING STRUCTURE:
{
  "content": "Full markdown text of the approach explanation.",
  "timeComplexity": "O(N log N)",
  "spaceComplexity": "O(N)"
}`;

    const userPrompt = "Generate the optimal editorial now.";

    try {
      const response = await provider.evaluate(systemPrompt, userPrompt);
      const parsed = JSON.parse(response);
      return parsed as GeneratedEditorial;
    } catch (error: any) {
      logger.error("Failed to generate editorial", { title: question.title, error: error.message });
      throw new Error(`Editorial generation failed: ${error.message}`);
    }
  }
}

export const editorialGenerationService = new EditorialGenerationService();
