import { GeminiProvider } from "../ai/ai.providers/gemini.provider";
import { logger } from "../../utils/logger";
import { GeneratedQuestion } from "./question-generation.service";

export interface GeneratedStarterCode {
  language: string;
  code: string;
}

export interface GeneratedSolution {
  language: string;
  code: string;
  approachName: string;
}

export class SolutionGenerationService {
  private getProvider() {
    return new GeminiProvider();
  }

  async generateSolutionsAndStarterCode(question: GeneratedQuestion): Promise<{ starterCodes: GeneratedStarterCode[]; solutions: GeneratedSolution[] }> {
    const provider = this.getProvider();
    
    const systemPrompt = `You are a core platform developer.
Generate the boilerplate starter code and the optimal solution code for the following problem in Python, JavaScript, and Java.

Problem: ${question.title}
Statement: ${question.problemStatement}

REQUIREMENTS:
1. "starterCodes": The boilerplate function signature for the user to complete. It should be syntactically correct but empty (e.g. \`pass\` in python, empty block in JS/Java).
2. "solutions": The fully implemented optimal solution in that language.
3. Supported languages exactly as: "python", "javascript", "java".

YOU MUST RETURN A VALID JSON OBJECT WITH THIS STRUCTURE:
{
  "starterCodes": [
    { "language": "python", "code": "def solve(arr):\\n    pass" }
  ],
  "solutions": [
    { "language": "python", "code": "def solve(arr):\\n    return arr", "approachName": "Optimal O(N)" }
  ]
}`;

    const userPrompt = "Generate starter codes and solutions now.";

    try {
      const response = await provider.evaluate(systemPrompt, userPrompt);
      const parsed = JSON.parse(response);
      return parsed as { starterCodes: GeneratedStarterCode[]; solutions: GeneratedSolution[] };
    } catch (error: any) {
      logger.error("Failed to generate solutions", { title: question.title, error: error.message });
      throw new Error(`Solution generation failed: ${error.message}`);
    }
  }
}

export const solutionGenerationService = new SolutionGenerationService();
