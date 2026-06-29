import { GeminiProvider } from "../ai/ai.providers/gemini.provider";
import { logger } from "../../utils/logger";
import { GeneratedQuestion } from "./question-generation.service";

export interface GeneratedTestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  testCaseType: string; // e.g., "Standard", "Edge Case", "Large Input"
}

export class TestCaseGenerationService {
  private getProvider() {
    return new GeminiProvider();
  }

  async generateTestCases(question: GeneratedQuestion): Promise<GeneratedTestCase[]> {
    const provider = this.getProvider();
    
    const systemPrompt = `You are a strict QA engineer for a coding platform.
Generate exactly 8 test cases for the following problem.

Problem: ${question.title}
Statement: ${question.problemStatement}
Constraints: ${question.constraints.join(", ")}

REQUIREMENTS:
1. Generate exactly 2 visible "Standard" test cases that show typical use.
2. Generate exactly 3 hidden "Edge Case" test cases (e.g., empty arrays, negative numbers, boundary constraints).
3. Generate exactly 3 hidden "Large Input" test cases to test performance limits.
4. "input" should be a single string formatted exactly as Judge0 will pipe to stdin. If multiple arguments, place them on new lines or space-separated as standard for competitive programming.
5. "expectedOutput" should be a single string representing the exact expected stdout.

YOU MUST RETURN A VALID JSON OBJECT WITH THIS STRUCTURE:
{
  "testCases": [
    {
      "input": "...",
      "expectedOutput": "...",
      "isHidden": false,
      "testCaseType": "Standard"
    }
  ]
}`;

    const userPrompt = "Generate the test cases now.";

    try {
      const response = await provider.evaluate(systemPrompt, userPrompt);
      const parsed = JSON.parse(response);
      return parsed.testCases as GeneratedTestCase[];
    } catch (error: any) {
      logger.error("Failed to generate test cases", { title: question.title, error: error.message });
      throw new Error(`TestCase generation failed: ${error.message}`);
    }
  }
}

export const testCaseGenerationService = new TestCaseGenerationService();
