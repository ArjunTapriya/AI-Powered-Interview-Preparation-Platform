export interface TokenUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  estimatedCostUsd?: number;
}

export interface AIProvider {
  name: string;
  evaluate(systemPrompt: string, userPrompt: string): Promise<string>;
  chat(systemPrompt: string, userPrompt: string): Promise<string>;
}
