import type { ChatMessage } from "../../../shared/types";
import { loadTrainingManual } from "../domain/providers/manualRepository";

type OpenAiResponse = {
  output?: Array<{
    type?: string;
    role?: string;
    content?: Array<
      | {
          type?: string;
          text?: string;
        }
      | undefined
    >;
  }>;
};

const SYSTEM_INSTRUCTION = `You are Just Breathe Coach.

You support learners and instructors working with the Just Breathe training material.

Ground your answers first in the training manual that is provided to you in the conversation context. Treat that manual as the primary source of truth for this app.

You may use general world knowledge when it helps, but only after grounding yourself in the manual. If you go beyond the manual, say so clearly.

Be practical, calm, and precise. Help the user learn, compare concepts, clarify confusion, and think through how to guide practices. Do not invent claims about the manual. If the manual does not support something directly, say that plainly.`;

function sanitizeMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages
    .filter(
      (message) =>
        (message.role === "user" || message.role === "assistant") &&
        message.content.trim().length > 0
    )
    .slice(-24);
}

function extractAssistantText(response: OpenAiResponse): string {
  const parts: string[] = [];

  for (const outputItem of response.output ?? []) {
    if (outputItem?.type !== "message" || outputItem.role !== "assistant") {
      continue;
    }

    for (const contentItem of outputItem.content ?? []) {
      if (contentItem?.type === "output_text" && contentItem.text) {
        parts.push(contentItem.text);
      }
    }
  }

  return parts.join("\n").trim();
}

export class ChatWithManualReactor {
  async process(messages: ChatMessage[]): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OpenAI is not configured on the server.");
    }

    const manual = await loadTrainingManual();
    const model = process.env.OPENAI_MODEL || "gpt-5-mini";
    const safeMessages = sanitizeMessages(messages);

    if (!safeMessages.length) {
      throw new Error("At least one user message is required.");
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        instructions: `${SYSTEM_INSTRUCTION}\n\nJUST BREATHE TRAINING MANUAL:\n${manual}`,
        input: safeMessages.map((message) => ({
          role: message.role,
          content: message.content
        })),
        max_output_tokens: 1200
      })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `OpenAI chat request failed (${response.status}). ${text}`.trim()
      );
    }

    const body = (await response.json()) as OpenAiResponse;
    const answer = extractAssistantText(body);

    if (!answer) {
      throw new Error("OpenAI returned no assistant text.");
    }

    return answer;
  }
}
