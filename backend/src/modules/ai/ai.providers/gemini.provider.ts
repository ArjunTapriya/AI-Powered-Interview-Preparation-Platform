import { AIProvider } from "./provider.interface";
import { env } from "../../../config/env";
import { logger } from "../../../utils/logger";

export class GeminiProvider implements AIProvider {
  readonly name = "gemini";

  async evaluate(systemPrompt: string, userPrompt: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || "";
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in the environment configurations.");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${systemPrompt}\n\nUser Input Data to Evaluate:\n${userPrompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      logger.error("Gemini API call failed", { status: response.status, error: errText });
      throw new Error(`Gemini API request failed: ${response.statusText} (${errText})`);
    }

    const data = (await response.json()) as any;
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }

  async chat(systemPrompt: string, userPrompt: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || "";
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in the environment configurations.");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${systemPrompt}\n\nUser Input:\n${userPrompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      logger.error("Gemini API call failed", { status: response.status, error: errText });
      throw new Error(`Gemini API request failed: ${response.statusText} (${errText})`);
    }

    const data = (await response.json()) as any;
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }

  /**
   * Streaming chat — yields text tokens progressively as Gemini generates them.
   */
  async *chatStream(
    systemPrompt: string,
    userPrompt: string
  ): AsyncGenerator<string> {
    const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || "";
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined.");
    }

    // streamGenerateContent returns newline-delimited JSON chunks
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:streamGenerateContent?alt=sse&key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: { temperature: 0.7 },
      }),
    });

    if (!response.ok || !response.body) {
      const errText = await response.text();
      throw new Error(`Gemini streaming API failed: ${response.statusText} (${errText})`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE lines are prefixed with "data: "
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data: ")) continue;
        const jsonStr = trimmed.slice(6).trim();
        if (!jsonStr || jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const token: string =
            parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
          if (token) yield token;
        } catch {
          // skip malformed lines
        }
      }
    }
  }

  async chatWithHistory(systemPrompt: string, history: { role: string, content: string }[], userMessage: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || "";
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in the environment configurations.");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`;

    const contents = [];

    // Map history to Gemini format. Roles must be 'user' or 'model'
    for (const msg of history) {
      if (!msg.content) continue;
      const role = msg.role === 'user' ? 'user' : 'model';
      contents.push({
        role,
        parts: [{ text: msg.content }]
      });
    }

    // Add the current user message
    contents.push({
      role: "user",
      parts: [{ text: userMessage }]
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents,
        generationConfig: {
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      logger.error("Gemini API call failed", { status: response.status, error: errText });
      throw new Error(`Gemini API request failed: ${response.statusText} (${errText})`);
    }

    const data = (await response.json()) as any;
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }
}
