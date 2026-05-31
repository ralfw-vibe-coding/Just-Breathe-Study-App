import type { Handler } from "@netlify/functions";
import type { ChatMessage, ChatResponse } from "../../src/shared/types";
import { ChatWithManualReactor } from "../../src/backend/body/reactors/chatWithManualReactor";
import { jsonResponse, methodNotAllowed, withAuth } from "./_shared";

const authedHandler: Handler = withAuth(async (event) => {
  if (event.httpMethod !== "POST") {
    return methodNotAllowed();
  }

  try {
    const body = JSON.parse(event.body ?? "{}") as {
      messages?: ChatMessage[];
    };

    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return jsonResponse(400, { error: "Chat messages are required." });
    }

    const reactor = new ChatWithManualReactor();
    const content = await reactor.process(body.messages);
    const response: ChatResponse = {
      message: {
        id: crypto.randomUUID(),
        role: "assistant",
        content,
        createdAt: new Date().toISOString()
      }
    };

    return jsonResponse(200, response);
  } catch (error) {
    return jsonResponse(500, {
      error: error instanceof Error ? error.message : "Chat request failed."
    });
  }
});

export const handler = authedHandler;
